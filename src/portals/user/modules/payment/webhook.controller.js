import {
    verifyWebhookSignature,
    finalizePayment,
    handleRefund,
    handleReversal,
    handleDenied,
    extractOrderId,
} from './service.js';

// PayPal webhooks we care about. Any other event types are acked but ignored —
// returning 200 prevents PayPal from retrying.
const HANDLED_EVENTS = new Set([
    'PAYMENT.CAPTURE.COMPLETED',
    'PAYMENT.CAPTURE.REFUNDED',
    'PAYMENT.CAPTURE.REVERSED',
    'PAYMENT.CAPTURE.DENIED',
]);

export const handlePayPalWebhook = async (req, res) => {
    try {
        const event = req.body;

        const isValid = await verifyWebhookSignature(req.headers, event);
        if (!isValid) {
            console.error('Invalid PayPal webhook signature');
            return res.status(400).send('Invalid signature');
        }

        const eventType = event.event_type;
        if (!HANDLED_EVENTS.has(eventType)) {
            // Unknown / uninteresting event — ack so PayPal stops retrying.
            return res.status(200).send('OK');
        }

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const orderId = extractOrderId(event.resource);
            if (!orderId) {
                console.error('CAPTURE.COMPLETED webhook had no extractable orderId');
                // 200 to acknowledge — re-delivery won't help if the payload is malformed.
                return res.status(200).send('OK');
            }

            const result = await finalizePayment(orderId, event);
            if (!result.payment) {
                console.warn(`Webhook received for unknown PayPal order: ${orderId}`);
            } else if (!result.alreadyComplete) {
                console.log(`Webhook finalized payment ${orderId}`);
            }
            return res.status(200).send('OK');
        }

        if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
            await handleRefund(event);
            return res.status(200).send('OK');
        }

        if (eventType === 'PAYMENT.CAPTURE.REVERSED') {
            await handleReversal(event);
            return res.status(200).send('OK');
        }

        if (eventType === 'PAYMENT.CAPTURE.DENIED') {
            await handleDenied(event);
            return res.status(200).send('OK');
        }

        // Defensive fallback — should be unreachable given the HANDLED_EVENTS gate.
        return res.status(200).send('OK');
    } catch (error) {
        console.error('Error handling PayPal webhook:', error);
        // 500 so PayPal retries; finalize/refund/reversal handlers are all idempotent.
        return res.status(500).send('Webhook handler failed');
    }
};
