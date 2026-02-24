import userService from './user.service.js';
import Response from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res, next) => {
    const { user, token } = await userService.register(req.body);
    res.status(201).json(Response.success('Successfully created', { token }, 201));
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json(Response.success('User logged in successfully', { token }));
});

export const getUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.json(Response.success('Users fetched successfully', users));
});
