import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        studentId: {
            type: String,
            unique: true,
            sparse: true // since existing users won't have it and might have null or undefined
        },
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
        },
        lastName: {
            type: String,
            default: '',
            trim: true,
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        isTrash: {
            type: Boolean,
            default: false,
        },
        activeToken: {
            type: String,
            default: null,
        },
        resetPasswordOtp: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
        avatar: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        enrolledCourses: [
            {
                courseId: { type: Schema.Types.ObjectId, ref: "Course" },
                enrolledAt: { type: Date, default: Date.now },
                isCompleted: { type: Boolean, default: false },
                completedAt: { type: Date, default: null }
            },
        ],
    },
    {
        timestamps: true, // Includes createdAt and updatedAt
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
