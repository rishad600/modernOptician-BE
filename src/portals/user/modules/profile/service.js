import userRepository from './repository.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';
import generateOtp from '../../../../utils/generateOtp.js';
import sendEmail from '../../../../utils/sendEmail.js';
import { getForgotPasswordTemplate } from '../../../../utils/emailTemplates.js';
import moment from 'moment-timezone';

// Format: 2-digit year + 3 random chars from a 32-char alphabet + checksum.
// That's only ~32^3 ≈ 33k IDs per year — collisions are realistic at scale, so the
// caller must retry on E11000 from the unique index on User.studentId.
const generateStudentIdCandidate = () => {
    const year = moment.tz(config.timezone).year().toString().slice(-2);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    let id = year;
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        id += char;
        sum += char.charCodeAt(0);
    }
    return `${id}${chars[sum % 32]}`;
};

const MAX_STUDENT_ID_ATTEMPTS = 5;

const generateToken = (id) =>
    jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.accessExpirationMinutes });

const register = async (userData) => {
    let lastErr;
    for (let attempt = 0; attempt < MAX_STUDENT_ID_ATTEMPTS; attempt++) {
        try {
            const user = await userRepository.create({
                ...userData,
                studentId: generateStudentIdCandidate(),
            });
            const token = generateToken(user._id);
            user.activeToken = token;
            await user.save();
            return { user, token };
        } catch (err) {
            // Only retry on duplicate-key for studentId; everything else (e.g. duplicate
            // email) should surface immediately.
            const isStudentIdCollision = err.code === 11000 && err.keyPattern?.studentId;
            if (!isStudentIdCollision) throw err;
            lastErr = err;
        }
    }
    const err = new Error('Could not generate a unique student ID; please retry');
    err.code = 500;
    err.cause = lastErr;
    throw err;
};

const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.matchPassword(password))) {
        const err = new Error('Invalid credentials');
        err.code = 401;
        throw err;
    }

    const token = generateToken(user._id);
    user.activeToken = token;
    await user.save();
    return { user, token };
};

const getAllUsers = async () => userRepository.findAll();
const getUserById = async (id) => userRepository.findById(id);
const updateProfile = async (userId, updateData) => userRepository.update(userId, updateData);

const changePassword = async (userId, currentPassword, newPassword) => {
    if (currentPassword === newPassword) {
        const err = new Error('Your new password must be different from your current password');
        err.code = 400;
        throw err;
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
        const err = new Error('User not found');
        err.code = 404;
        throw err;
    }

    if (!(await user.matchPassword(currentPassword))) {
        const err = new Error('The current password you entered is incorrect. Please try again.');
        err.code = 400;
        throw err;
    }

    user.password = newPassword;
    await user.save();
    return user;
};

// Why: returning a different response for unknown emails allows account enumeration.
// We always return success; if the email maps to a real user, we send the OTP.
const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        return { message: 'If that email is registered, an OTP has been sent.' };
    }

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = moment.tz(config.timezone).add(10, 'minutes').toDate();
    await user.save();

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. \n\n Your OTP is: ${otp}\n\n It is valid for 10 minutes.\n`;
    const html = getForgotPasswordTemplate(user.name, otp);

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset OTP',
            message,
            html,
        });
    } catch (error) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        console.error('Forgot password email send failed:', error);
        // Still return the same generic message to avoid revealing the failure.
    }

    return { message: 'If that email is registered, an OTP has been sent.' };
};

// Why: collapsing "no such email" / "wrong OTP" / "expired OTP" into one generic
// 400 prevents account enumeration via the reset endpoint.
const resetPassword = async (email, otp, newPassword) => {
    const user = await userRepository.findByEmailWithOtp(email);
    const invalid = () => {
        const err = new Error('Invalid or expired OTP');
        err.code = 400;
        return err;
    };

    if (!user || !user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
        throw invalid();
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < moment.tz(config.timezone).toDate()) {
        throw invalid();
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
};

export default {
    register,
    login,
    getAllUsers,
    getUserById,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
};
