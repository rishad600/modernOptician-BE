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

export default {
    register,
    login,
    getProfile,
    changePassword,
    forgotPassword,
    resetPassword,
};
