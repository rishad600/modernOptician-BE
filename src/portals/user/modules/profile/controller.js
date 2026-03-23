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

const getUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.json(Response.success('Users fetched successfully', users));
});

const changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    await userService.changePassword(userId, oldPassword, newPassword);

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
    getUsers,
    changePassword,
    forgotPassword,
    resetPassword,
};
