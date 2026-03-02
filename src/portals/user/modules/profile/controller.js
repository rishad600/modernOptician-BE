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

export default {
    register,
    login,
    getUsers,
};
