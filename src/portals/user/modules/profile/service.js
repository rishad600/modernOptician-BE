import userRepository from './repository.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';
import generateOtp from '../../../../utils/generateOtp.js';
import sendEmail from '../../../../utils/sendEmail.js';
import { getForgotPasswordTemplate } from '../../../../utils/emailTemplates.js';
import moment from 'moment-timezone';

const generateUniqueStudentId = () => {
    try {
        const year = moment.tz(config.timezone).year().toString().slice(-2);
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

        let id = year;
        let sum = 0;

        for (let i = 0; i < 3; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            id += char;
            sum += char.charCodeAt(0);
        }

        const checksum = chars[sum % 32];
        return `${id}${checksum}`;
    } catch (error) {
        throw error;
    }
};

const register = async (userData) => {
    try {
        userData.studentId = generateUniqueStudentId();
        const user = await userRepository.create(userData);
        const token = generateToken(user._id);

        user.activeToken = token;
        await user.save();

        return { user, token };
    } catch (error) {
        throw error;
    }
};

const login = async (email, password) => {
    try {
        const user = await userRepository.findByEmail(email);

        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken(user._id);

        user.activeToken = token;
        await user.save();

        return { user, token };
    } catch (error) {
        throw error;
    }
};

const getAllUsers = async () => {
    try {
        return await userRepository.findAll();
    } catch (error) {
        throw error;
    }
};

const getUserById = async (id) => {
    try {
        return await userRepository.findById(id);
    } catch (error) {
        throw error;
    }
};

const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        if (currentPassword === newPassword) {
            const err = new Error('Your new password must be different from your current password');
            err.code = 400;
            throw err;
        }

        const user = await userRepository.findByIdWithPassword(userId);

        if (!user) {
            const err = new Error('User not found');
            err.code = 206;
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
    } catch (error) {
        throw error;
    }
};

const forgotPassword = async (email) => {
    try {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            const err = new Error('There is no user with that email address');
            err.code = 404;
            throw err;
        }

        const otp = generateOtp();

        // Set OTP and expiration (10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = moment.tz(config.timezone).add(10, 'minutes').toDate();
        await user.save();

        // Send email
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

            const err = new Error('Email could not be sent');
            err.code = 500;
            throw err;
        }
        return { message: 'Email sent' };
    } catch (error) {
        throw error;
    }
};

const resetPassword = async (email, otp, newPassword) => {
    try {
        const user = await userRepository.findByEmailWithOtp(email);

        if (!user) {
            const err = new Error('There is no user with that email address');
            err.code = 404;
            throw err;
        }

        if (user.resetPasswordOtp !== otp) {
            const err = new Error('Invalid OTP');
            err.code = 400;
            throw err;
        }

        if (user.resetPasswordExpires < moment.tz(config.timezone).toDate()) {
            const err = new Error('OTP has expired');
            err.code = 400;
            throw err;
        }

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return user;
    } catch (error) {
        throw error;
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes,
    });
};

const updateProfile = async (userId, updateData) => {
    try {
        return await userRepository.update(userId, updateData);
    } catch (error) {
        throw error;
    }
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
