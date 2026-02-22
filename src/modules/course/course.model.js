import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a course name'],
            trim: true,
        },
        isTrash: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export default mongoose.model('Course', courseSchema);
