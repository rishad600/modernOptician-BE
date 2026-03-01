import mongoose from "mongoose";

const { Schema } = mongoose;

const ProgressSchema = new Schema(
    {
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
        chapterId: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
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

export default mongoose.model('Progress', ProgressSchema);
