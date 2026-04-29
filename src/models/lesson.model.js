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
        isTrash: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// courseId is the foreign key joined from every course-detail aggregation; bunnyVideoId
// is the lookup field for the Bunny webhook and the deleteVideo updateMany.
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ bunnyVideoId: 1 });

export default mongoose.model('Lesson', LessonSchema);