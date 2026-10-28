import asyncHandler from '../../../../utils/asyncHandler.js';
import Course from '../../../../models/course.model.js';
import Payment from '../../../../models/payment.model.js';
import Enrollment from '../../../../models/enrollment.model.js';
import Response from '../../../../utils/response.js';
import * as payPalService from './service.js';

export const createPayPalOrder = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json(Response.error('Course not found', 404));
    }

    // Block re-purchase via the canonical Enrollment collection (the source of truth).
    const existingEnrollment = await Enrollment.findOne({ studentId: userId, courseId });
    if (existingEnrollment) {
        return res.status(409).json(Response.error('Already enrolled in this course', 409));
    }

    const amount = course.price;
    const currency = course.currency || 'USD';
    const customId = `${userId.toString()}_${courseId.toString()}`;
    const orderData = await payPalService.createOrder(amount, currency, course.name, customId);

    // Why no transactionDetails on create: the response is mostly the orderId (which we
    // already store as paypalOrderId) and links. PayPal retains the full payload server-side.
    await Payment.create({
        userId,
        courseId,
        paypalOrderId: orderData.id,
        amount,
        currency,
        status: 'CREATED',
    });

    return res.status(201).json(Response.success('Order created', { orderId: orderData.id }, 201));
});

export const capturePayPalOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findOne({ paypalOrderId: orderId, userId });
    if (!payment) {
        return res.status(404).json(Response.error('Payment record not found', 404));
    }

    if (payment.status === 'COMPLETED') {
        // Webhook (or a previous capture call) already finalized this. Idempotent success.
        return res.status(200).json(Response.success('Payment already completed', null, 200));
    }

    const captureData = await payPalService.captureOrder(orderId);

    if (captureData.status === 'COMPLETED') {
        try {
            await payPalService.finalizePayment(orderId, captureData);
        } catch (err) {
            // Amount/currency mismatch — surface as 422 Unprocessable Entity so support
            // can investigate. The Payment row is left unchanged (still not COMPLETED).
            if (err.name === 'PaymentMismatchError') {
                console.error('Payment mismatch refused finalization:', err.details);
                return res.status(422).json(Response.error(err.message, 422));
            }
            throw err;
        }
        return res.status(200).json(
            Response.success('Payment successful and course enrolled', null, 200)
        );
    }

    // Capture didn't complete; persist whatever PayPal told us so the webhook can reconcile later.
    payment.status = captureData.status || 'FAILED';
    await payment.save();

    return res
        .status(400)
        .json(Response.error(`Payment capture did not complete (status: ${captureData.status})`, 400));
});
