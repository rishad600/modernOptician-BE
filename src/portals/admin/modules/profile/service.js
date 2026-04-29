import adminRepository from './repository.js';
import config from '../../../../config/config.js';
import jwt from 'jsonwebtoken';

// Why: admin registration is now performed by an existing super-admin, not by the new
// admin themselves. Don't issue a session token for someone else's account.
const register = async (adminData) => {
    const admin = await adminRepository.create(adminData);
    return { admin };
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
