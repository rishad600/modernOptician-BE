import mongoose from 'mongoose';
import moment from 'moment-timezone';
import config from '../config/config.js';

const { Schema } = mongoose;

const EnrollmentSchema = new Schema(
    {
        // Now explicitly refs User
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        // Payment details
        amountPaid: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        paymentId: { type: String },
        paymentMethod: {
            type: String,
            enum: ["Credit Card", "UPI", "Debit Card", "Net Banking", "PayPal", "N/A"],
            default: "N/A",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },

        enrolledAt: { type: Date, default: () => moment.tz(config.timezone).toDate() },
        expiresAt: { type: Date, default: null }, // null = lifetime access

        // Course completion is tracked here, on the canonical enrollment row.
        // (Previously also duplicated on User.enrolledCourses; that has been removed.)
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },

        // If admin manually enrolled a student (e.g. free access)
        manuallyEnrolledBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
    },
    { timestamps: true }
);

// Idempotency guard: a student can only be enrolled in a given course once.
// The capture flow + the PayPal webhook both try to create an enrollment;
// this index makes the second one fail with E11000, which we catch as "already enrolled".
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Hot-path query indexes used by webhook lookup and admin/dashboard stats.
EnrollmentSchema.index({ paymentId: 1 });
EnrollmentSchema.index({ paymentStatus: 1, enrolledAt: -1 });

export default mongoose.model('Enrollment', EnrollmentSchema);