import mongoose from 'mongoose';

const { Schema } = mongoose;

const EnrollmentSchema = new Schema(
    {
        // Now explicitly refs Student, not a generic User
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
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
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },

        enrolledAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: null }, // null = lifetime access

        // If admin manually enrolled a student (e.g. free access)
        manuallyEnrolledBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Enrollment', EnrollmentSchema);