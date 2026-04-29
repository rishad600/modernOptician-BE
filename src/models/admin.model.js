import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const adminSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
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
        avatar: { type: String, default: null },
        isSuperAdmin: { type: Boolean, default: false },
        lastActiveAt: { type: Date, default: null },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        }
    },
    {
        timestamps: true, // Includes createdAt and updatedAt
    }
);

// Encrypt password using bcrypt.
// Why: previous version called next() without `return` and never called it at the end,
// which double-hashed the password on every non-password save (e.g. login updating activeToken).
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match admin entered password to hashed password in database
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
