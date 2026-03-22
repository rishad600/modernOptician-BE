import userRepository from './repository.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';

const register = async (userData) => {
    const user = await userRepository.create(userData);
    const token = generateToken(user._id);

    user.activeToken = token;
    await user.save();

    return { user, token };
};

const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await user.matchPassword(password))) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);

    user.activeToken = token;
    await user.save();

    return { user, token };
};

const getAllUsers = async () => {
    return await userRepository.findAll();
};

const getUserById = async (id) => {
    return await userRepository.findById(id);
};

const changePassword = async (userId, oldPassword, newPassword) => {
    if (oldPassword === newPassword) {
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

    if (!(await user.matchPassword(oldPassword))) {
        const err = new Error('Password is incorrect');
        err.code = 400;
        throw err;
    }

    user.password = newPassword;
    await user.save();

    return user;
};

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes,
    });
};

export default {
    register,
    login,
    getAllUsers,
    getUserById,
    changePassword,
};
