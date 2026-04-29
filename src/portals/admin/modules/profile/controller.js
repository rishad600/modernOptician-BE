import adminService from './service.js';
import asyncHandler from '../../../../utils/asyncHandler.js';
import Response from '../../../../utils/response.js';

const register = asyncHandler(async (req, res, next) => {
    // createdBy comes from the authenticated super-admin — never trust the body for it.
    const adminData = { ...req.body, createdBy: req.admin._id };
    const { admin } = await adminService.register(adminData);
    res.status(201).json(Response.success('Admin created', { admin }, 201));
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { admin, token } = await adminService.login(email, password);
    res.json(Response.success('Admin logged in successfully', { admin, token }));
});

export default {
    register,
    login,
};
