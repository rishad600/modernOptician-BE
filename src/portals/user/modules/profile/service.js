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
};
