import Response from '../utils/response.js';

// Gate that must run AFTER `protectAdmin` — relies on req.admin being populated.
const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || !req.admin.isSuperAdmin) {
        return res.status(403).json(Response.error('Super-admin privileges required', 403));
    }
    next();
};

export default requireSuperAdmin;
