import mongoose from 'mongoose';
import moment from 'moment-timezone';
import config from '../config/config.js';

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


        tags: {
            type: [String],
            default: [],
        },
        contentType: {
            type: String,
            enum: ['Blog Post', 'Article'],
            default: 'Blog Post',
        },
        excerpt: {
            type: String,
            default: '',
        },
        publishDate: {
            type: Date,
            default: () => moment.tz(config.timezone).toDate(),
        },
        aboutAuthor: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Published', 'Draft'],
            default: 'Draft',
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
