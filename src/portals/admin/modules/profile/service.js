import adminRepository from './repository.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';

const register = async (adminData) => {
    const admin = await adminRepository.create(adminData);
    const token = generateToken(admin._id);

    admin.activeToken = token;
    await admin.save();

    return { admin, token };
};

const login = async (email, password) => {
    const admin = await adminRepository.findByEmail(email);

    if (!admin || !(await admin.matchPassword(password))) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(admin._id);

    admin.activeToken = token;
    await admin.save();

    return { admin, token };
};

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes,
    });
};

export default {
    register,
    login,
};
