import mongoose from "mongoose";

const { Schema } = mongoose;

const ActivityLogSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                "payment_received",
                "payment_confirmed",
                "enrollment",
                "user_joined",
                "refund_issued",       // new — admin triggered refund
                "manual_enrollment",   // new — admin manually enrolled a student
            ],
            required: true,
        },

        message: { type: String, required: true },
        // e.g. "New payment received from John Doe for Basic Optical Science"

        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            default: null,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null,           // who triggered the action (for admin events)
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            default: null,
        },
        amount: { type: Number, default: null },
    },
    { timestamps: true }
);

export default mongoose.model('Activity', ActivityLogSchema);