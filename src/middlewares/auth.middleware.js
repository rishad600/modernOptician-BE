import User from '../modules/user/user.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import Response from '../utils/response.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json(Response.error('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.id);

        // Check if user exists and if the token matches the activeToken
        if (!user || user.activeToken !== token) {
            return res.status(401).json(Response.error('Not authorized to access this route, invalid or expired session', 401));
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json(Response.error('Not authorized to access this route', 401));
    }
};

export default protect;
