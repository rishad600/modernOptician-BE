import mongoose from 'mongoose';

const { Schema } = mongoose;

const LessonSchema = new Schema(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        videoUrl: { type: String },
        bunnyVideoId: { type: String, default: null },
        videoStatus: { 
            type: String, 
            enum: ['Queued', 'Processing', 'Encoding', 'Finished', 'ResolutionFinished', 'Failed'], 
            default: null 
        },
        duration: { type: Number, default: 0 }, // in seconds
        order: { type: Number, required: true },
        isFreePreview: { type: Boolean, default: false },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Lesson', LessonSchema);