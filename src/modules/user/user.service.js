import userRepository from './user.repository.js';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

class UserService {
    async register(userData) {
        return await userRepository.create(userData);
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);

        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id);

        // Save the active token to enforce single login
        user.activeToken = token;
        await user.save();

        return { user, token };
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }

    async getUserById(id) {
        return await userRepository.findById(id);
    }

    generateToken(id) {
        return jwt.sign({ id }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpirationMinutes,
        });
    }
}

export default new UserService();
