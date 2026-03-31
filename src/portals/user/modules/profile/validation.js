import Joi from 'joi';

const register = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const changePassword = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

const forgotPassword = Joi.object({
    email: Joi.string().email().required(),
});

const resetPassword = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required(),
});

const updateProfile = Joi.object({
    name: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
});

export default {
    register,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
};
