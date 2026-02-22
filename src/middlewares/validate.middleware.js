import Response from '../utils/response.js';

const validate = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(400).json(Response.error(errorMessage, 400));
    }

    Object.assign(req, value);
    return next();
};

export default validate;
