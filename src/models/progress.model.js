import mongoose from "mongoose";

const { Schema } = mongoose;

const ProgressSchema = new Schema(
    {
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
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
        },

        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },

        watchedSeconds: { type: Number, default: 0 }, // for resume playback
        lastWatchedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Resume-playback / completion lookups always go (studentId, courseId, lessonId).
ProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ studentId: 1, courseId: 1 });

export default mongoose.model('Progress', ProgressSchema);
