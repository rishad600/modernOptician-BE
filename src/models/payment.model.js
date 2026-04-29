import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        paypalOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        // PayPal's capture id (resource.id from a CAPTURE.COMPLETED event). Populated
        // when the payment is finalized; used to map refund/reversal webhooks back to us.
        paypalCaptureId: {
            type: String,
            default: null,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        status: {
            type: String,
            enum: [
                'CREATED',
                'SAVED',
                'APPROVED',
                'VOIDED',
                'COMPLETED',
                'PAYER_ACTION_REQUIRED',
                'FAILED',
                'DENIED',
                'REFUNDED',
                'REVERSED',
            ],
            default: 'CREATED',
        },
        payerEmail: {
            type: String,
        },
        payerId: {
            type: String,
        },
        paymentSource: {
            type: String,
            default: 'paypal',
        },
        // Curated transaction metadata only — never store the raw PayPal payload here.
        // The full event lives at PayPal; we keep what we need for support/debugging.
        transactionDetails: {
            type: new Schema(
                {
                    capturedAmount: { type: Number, default: null },
                    capturedCurrency: { type: String, default: null },
                    paypalFee: { type: Number, default: null },
                    netAmount: { type: Number, default: null },
                    captureStatus: { type: String, default: null },
                    refundedAmount: { type: Number, default: null },
                },
                { _id: false }
            ),
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

// TTL: auto-purge Payment rows that never moved out of CREATED (user abandoned the order).
// PayPal orders auto-expire at ~3h, so 4h is a safe gravestone window. Once a row's
// status changes (e.g. to COMPLETED), the partial filter no longer matches and TTL
// stops considering it for deletion.
paymentSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 4 * 60 * 60,
        partialFilterExpression: { status: 'CREATED' },
    }
);

export default mongoose.model('Payment', paymentSchema);
