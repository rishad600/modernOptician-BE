import mongoose from 'mongoose';

const { Schema } = mongoose;

const LessonSchema = new Schema(
    {
        chapterId: {
            type: Schema.Types.ObjectId,
            ref: "Chapter",
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        title: { type: String, required: true },
        videoUrl: { type: String },
        duration: { type: Number, default: 0 }, // in seconds
        order: { type: Number, required: true },
        isFreePreview: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Lesson', LessonSchema);