import mongoose from 'mongoose';

const { Schema } = mongoose;

const blogSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a blog title'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Please add blog content'],
        },
        author: {
            type: String, // String for manual entry, or could be populated if using ref
            required: true,
        },
        thumbnail: {
            type: String,
            required: [true, 'Please add a blog header image'],
        },
        quote: {
            type: String,
            default: '',
        },
        category: {
            type: [String], // E.g., ['TECHNOLOGY', 'AI', 'FUTURE']
            default: [],
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        isTrash: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export default mongoose.model('Blog', blogSchema);
