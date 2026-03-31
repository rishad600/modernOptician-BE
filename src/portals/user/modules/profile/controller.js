import userService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const register = asyncHandler(async (req, res, next) => {
    const { user, token } = await userService.register(req.body);
    res.status(201).json(Response.success('Successfully created', { user, token }, 201));
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json(Response.success('User logged in successfully', { user, token }));
});

const getProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await userService.getUserById(userId);
    res.json(Response.success('Profile fetched successfully', user));
});

const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    await userService.changePassword(userId, currentPassword, newPassword);

    res.json(Response.success('Password changed successfully'));
});

const forgotPassword = asyncHandler(async (req, res, next) => {
    await userService.forgotPassword(req.body.email);
    res.json(Response.success('OTP sent to email'));
});

const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    await userService.resetPassword(email, otp, newPassword);
    res.json(Response.success('Password reset successfully'));
});

const updateProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { name, lastName, phone } = req.body;
    
    // Only pass defined fields to avoid completely removing others if they aren't part of the request
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    await userService.updateProfile(userId, updateData);
    res.json(Response.success('Profile updated successfully'));
});

export default {
    register,
    login,
    getProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
};
