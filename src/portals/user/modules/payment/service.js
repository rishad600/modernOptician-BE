import axios from 'axios';
import config from '../../../../config/config.js';
import Payment from '../../../../models/payment.model.js';
import Enrollment from '../../../../models/enrollment.model.js';

// ---------------------------------------------------------------------------
// PayPal access token cache
// ---------------------------------------------------------------------------
// Why: every API call previously fetched a fresh token. PayPal tokens are valid
// for ~9h, so caching cuts our PayPal traffic in half. We refresh 60s before
// expiry to absorb clock skew and slow API responses.
let cachedToken = null;
let cachedTokenExpiresAt = 0;
const TOKEN_REFRESH_MARGIN_MS = 60_000;

const fetchAccessToken = async () => {
    if (!config.paypal.clientId || !config.paypal.clientSecret) {
        throw new Error('MISSING_API_CREDENTIALS');
    }
    const auth = Buffer.from(
        `${config.paypal.clientId}:${config.paypal.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
        `${config.paypal.apiBase}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return {
        token: response.data.access_token,
        expiresInSec: Number(response.data.expires_in) || 32_400,
    };
};

export const generateAccessToken = async () => {
    const now = Date.now();
    if (cachedToken && now < cachedTokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
        return cachedToken;
    }
    try {
        const { token, expiresInSec } = await fetchAccessToken();
        cachedToken = token;
        cachedTokenExpiresAt = now + expiresInSec * 1000;
        return cachedToken;
    } catch (error) {
        console.error('Failed to generate PayPal access token:', error.message);
        // If the cached token is still technically valid, fall back to it rather
        // than failing — PayPal will reject if it's actually invalid.
        if (cachedToken && now < cachedTokenExpiresAt) return cachedToken;
        throw error;
    }
};

// ---------------------------------------------------------------------------
// PayPal API wrappers
// ---------------------------------------------------------------------------

const authedHeaders = async () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await generateAccessToken()}`,
});

export const createOrder = async (amount, currency = 'USD', courseName = 'Online Course', customId = null) => {
    const url = `${config.paypal.apiBase}/v2/checkout/orders`;
    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                reference_id: customId ? customId.toString() : undefined,
                custom_id: customId ? customId.toString() : undefined,
                description: `Enrollment: ${courseName}`,
                amount: {
                    currency_code: currency,
                    value: parseFloat(amount).toFixed(2),
                    breakdown: {
                        item_total: { currency_code: currency, value: parseFloat(amount).toFixed(2) },
                    },
                },
                items: [
                    {
                        name: courseName.substring(0, 127),
                        quantity: '1',
                        category: 'DIGITAL_GOODS',
                        unit_amount: { currency_code: currency, value: parseFloat(amount).toFixed(2) },
                    },
                ],
            },
        ],
        payment_source: {
            paypal: {
                experience_context: {
                    brand_name: 'Optician Online Class',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                },
            },
        },
    };

    const response = await axios.post(url, payload, { headers: await authedHeaders() });
    return response.data;
};

export const captureOrder = async (orderId) => {
    const url = `${config.paypal.apiBase}/v2/checkout/orders/${orderId}/capture`;
    const response = await axios.post(url, {}, { headers: await authedHeaders() });
    return response.data;
};

export const verifyWebhookSignature = async (headers, event) => {
    const url = `${config.paypal.apiBase}/v1/notifications/verify-webhook-signature`;
    const payload = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: config.paypal.webhookId,
        webhook_event: event,
    };

    try {
        const response = await axios.post(url, payload, { headers: await authedHeaders() });
        return response.data.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('Webhook signature verification failed:', error.response?.data || error.message);
        return false;
    }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reliable order-id extraction from a capture resource. PayPal's documented field is
 * `supplementary_data.related_ids.order_id`. We fall back to parsing the `up` link only
 * if the documented field is absent — that link's contract is not stable.
 */
export const extractOrderId = (captureResource) => {
    if (!captureResource) return null;
    const documented = captureResource.supplementary_data?.related_ids?.order_id;
    if (documented) return documented;
    const upLink = captureResource.links?.find((l) => l.rel === 'up')?.href;
    if (upLink) return upLink.split('/').pop() || null;
    return null;
};

/**
 * Reliable capture-id extraction. For CAPTURE.COMPLETED events, `resource.id` is the
 * capture id. For REFUND.* events the capture sits at links[rel=up].
 */
export const extractCaptureId = (resource, eventType) => {
    if (!resource) return null;
    if (eventType?.startsWith('PAYMENT.CAPTURE.') && eventType !== 'PAYMENT.CAPTURE.REFUNDED') {
        return resource.id || null;
    }
    // For refunds: the refund's `up` link points to the capture.
    const upLink = resource.links?.find((l) => l.rel === 'up')?.href;
    if (upLink) return upLink.split('/').pop() || null;
    return resource.id || null;
};

/**
 * Pull the actual captured amount from either a webhook event or the synchronous
 * capture response. Returns { amount, currency } or null.
 */
const extractCapturedMoney = (eventOrCapture) => {
    // Synchronous capture response shape: { purchase_units: [{ payments: { captures: [...] }}] }
    const syncCapture = eventOrCapture?.purchase_units?.[0]?.payments?.captures?.[0];
    if (syncCapture?.amount) {
        return {
            amount: parseFloat(syncCapture.amount.value),
            currency: syncCapture.amount.currency_code,
            paypalFee: syncCapture.seller_receivable_breakdown?.paypal_fee?.value
                ? parseFloat(syncCapture.seller_receivable_breakdown.paypal_fee.value)
                : null,
            netAmount: syncCapture.seller_receivable_breakdown?.net_amount?.value
                ? parseFloat(syncCapture.seller_receivable_breakdown.net_amount.value)
                : null,
            captureStatus: syncCapture.status,
            captureId: syncCapture.id,
        };
    }
    // Webhook shape: { resource: { amount: {...}, ... } }
    const res = eventOrCapture?.resource;
    if (res?.amount) {
        return {
            amount: parseFloat(res.amount.value),
            currency: res.amount.currency_code,
            paypalFee: res.seller_receivable_breakdown?.paypal_fee?.value
                ? parseFloat(res.seller_receivable_breakdown.paypal_fee.value)
                : null,
            netAmount: res.seller_receivable_breakdown?.net_amount?.value
                ? parseFloat(res.seller_receivable_breakdown.net_amount.value)
                : null,
            captureStatus: res.status,
            captureId: res.id,
        };
    }
    return null;
};

const extractPayer = (eventOrCapture) => {
    return eventOrCapture?.resource?.payer || eventOrCapture?.payer || {};
};

// ---------------------------------------------------------------------------
// finalizePayment — idempotent + amount-verified
// ---------------------------------------------------------------------------

class PaymentMismatchError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'PaymentMismatchError';
        this.details = details;
        this.code = 422;
    }
}

/**
 * Idempotently finalize a payment that PayPal has confirmed as captured.
 *
 * Invoked from BOTH the client-driven capture endpoint and the PayPal webhook;
 * whichever arrives first wins, the other is a no-op.
 *
 * Refuses to finalize if the captured amount/currency doesn't match the order
 * we created — protects against a corrupted/forged response or accidental
 * partial capture.
 *
 * @param {string} orderId
 * @param {object} eventOrCapture  webhook event OR sync capture response
 * @returns {Promise<{ alreadyComplete: boolean, payment: object | null }>}
 */
export const finalizePayment = async (orderId, eventOrCapture) => {
    const payment = await Payment.findOne({ paypalOrderId: orderId });
    if (!payment) return { alreadyComplete: false, payment: null };
    if (payment.status === 'COMPLETED') return { alreadyComplete: true, payment };

    const captured = extractCapturedMoney(eventOrCapture);
    if (!captured) {
        throw new PaymentMismatchError('PayPal response did not include a captured amount', { orderId });
    }

    // Money sanity check. Use a tiny epsilon to absorb floating-point noise.
    const expected = Number(payment.amount).toFixed(2);
    const actual = captured.amount.toFixed(2);
    if (expected !== actual) {
        throw new PaymentMismatchError(
            `Captured amount ${actual} ${captured.currency} does not match expected ${expected} ${payment.currency}`,
            { orderId, expected, actual }
        );
    }
    if (captured.currency !== payment.currency) {
        throw new PaymentMismatchError(
            `Currency mismatch: captured ${captured.currency}, expected ${payment.currency}`,
            { orderId, expected: payment.currency, actual: captured.currency }
        );
    }

    const payer = extractPayer(eventOrCapture);
    payment.status = 'COMPLETED';
    payment.payerEmail = payer.email_address;
    payment.payerId = payer.payer_id;
    payment.paypalCaptureId = captured.captureId || null;
    payment.transactionDetails = {
        capturedAmount: captured.amount,
        capturedCurrency: captured.currency,
        paypalFee: captured.paypalFee,
        netAmount: captured.netAmount,
        captureStatus: captured.captureStatus,
    };
    await payment.save();

    try {
        await Enrollment.create({
            studentId: payment.userId,
            courseId: payment.courseId,
            amountPaid: payment.amount,
            currency: payment.currency,
            paymentId: orderId,
            paymentMethod: 'PayPal',
            paymentStatus: 'completed',
        });
    } catch (err) {
        // E11000 = the unique (studentId, courseId) index fired because the other
        // path (webhook or capture) already created the enrollment. That's success.
        if (err.code !== 11000) throw err;
    }

    return { alreadyComplete: false, payment };
};

// ---------------------------------------------------------------------------
// Refund / reversal / denial handlers
// ---------------------------------------------------------------------------

/**
 * Find the Payment row that owns this webhook event. Strategy:
 *  1. If the event's resource has a captureId we recognize, use it.
 *  2. Otherwise fall back to custom_id (which we set as `${userId}_${courseId}`).
 */
const findPaymentForEvent = async (resource, eventType) => {
    const captureId = extractCaptureId(resource, eventType);
    if (captureId) {
        const byCapture = await Payment.findOne({ paypalCaptureId: captureId });
        if (byCapture) return byCapture;
    }
    const customId = resource?.custom_id;
    if (customId && customId.includes('_')) {
        const [userId, courseId] = customId.split('_');
        // Most recent matching payment wins (handles re-purchase scenarios).
        return Payment.findOne({ userId, courseId }).sort({ createdAt: -1 });
    }
    return null;
};

/**
 * Handle PAYMENT.CAPTURE.REFUNDED. Marks the payment REFUNDED and the enrollment
 * `refunded`, which transparently revokes course access (the read paths filter on
 * paymentStatus === 'completed').
 */
export const handleRefund = async (event) => {
    const resource = event.resource;
    const payment = await findPaymentForEvent(resource, event.event_type);
    if (!payment) {
        console.warn(`Refund webhook for unknown payment (refundId=${resource?.id})`);
        return { handled: false };
    }

    if (payment.status === 'REFUNDED') return { handled: true, alreadyDone: true };

    const refundedAmount = parseFloat(resource?.amount?.value) || null;
    payment.status = 'REFUNDED';
    payment.transactionDetails = {
        ...(payment.transactionDetails?.toObject?.() || payment.transactionDetails || {}),
        refundedAmount,
    };
    await payment.save();

    await Enrollment.updateOne(
        { studentId: payment.userId, courseId: payment.courseId },
        { paymentStatus: 'refunded' }
    );

    return { handled: true, payment };
};

/**
 * Handle PAYMENT.CAPTURE.REVERSED (chargeback / forced reversal). Same effect as a
 * refund from our side — the user loses access, the row is flagged.
 */
export const handleReversal = async (event) => {
    const resource = event.resource;
    const payment = await findPaymentForEvent(resource, event.event_type);
    if (!payment) {
        console.warn(`Reversal webhook for unknown payment (id=${resource?.id})`);
        return { handled: false };
    }

    if (payment.status === 'REVERSED') return { handled: true, alreadyDone: true };

    payment.status = 'REVERSED';
    await payment.save();

    await Enrollment.updateOne(
        { studentId: payment.userId, courseId: payment.courseId },
        { paymentStatus: 'refunded' }
    );

    return { handled: true, payment };
};

/**
 * Handle PAYMENT.CAPTURE.DENIED. The capture attempt failed at PayPal — no enrollment
 * was created, so we just record the failure on the Payment row for support.
 */
export const handleDenied = async (event) => {
    const resource = event.resource;
    const payment = await findPaymentForEvent(resource, event.event_type);
    if (!payment) return { handled: false };

    if (payment.status === 'COMPLETED') {
        // Suspicious: PayPal denied a capture that we already marked completed.
        console.error(`DENIED webhook for already-completed payment ${payment.paypalOrderId}`);
        return { handled: false };
    }

    payment.status = 'DENIED';
    await payment.save();
    return { handled: true, payment };
};
