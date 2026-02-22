import userService from './user.service.js';
import Response from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res, next) => {
    const user = await userService.register(req.body);
    res.status(201).json(Response.success('User registered successfully', user, 201));
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json(Response.success('User logged in successfully', { user, token }));
});

export const getUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.json(Response.success('Users fetched successfully', users));
});
