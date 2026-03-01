import mongoose from 'mongoose';

const { Schema } = mongoose;

const courseSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a course name'],
            trim: true,
        },
        description: { type: String },
        thumbnail: { type: String },
        price: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        isTrash: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            enum: ["Optometry", "Retail Management", "Contact Lens", "Dispensing"],
            required: true,
        },
        features: { type: [String], default: [] },
        totalDuration: { type: Number, default: 0 }, // in minutes  
        isPublished: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export default mongoose.model('Course', courseSchema);
