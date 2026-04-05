import Response from '../utils/response.js';

const validate = (schema) => (req, res, next) => {
    const validSchema = {};
    const sources = ['query'];

    // Check if schema is structured for multi-source validation
    const hasSource = sources.some(key => schema[key]);

    if (hasSource) {
        // Validate each source
        for (const source of sources) {
            if (schema[source]) {
                const { value, error } = schema[source].validate(req[source]);
                if (error) {
                    const errorMessage = error.details.map((details) => details.message).join(', ');
                    return res.status(400).json(Response.error(`Validation failed for ${source}: ${errorMessage}`, 400));
                }
                Object.assign(req[source], value);
            }
        }
    } else {
        // Legacy behavior: Validate req.body
        const { value, error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details.map((details) => details.message).join(', ');
            return res.status(400).json(Response.error(errorMessage, 400));
        }
        Object.assign(req.body, value);
    }

    return next();
};

export default validate;
