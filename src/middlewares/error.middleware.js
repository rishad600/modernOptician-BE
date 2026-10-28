import Response from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
    let statusCode = err.code && Number.isInteger(err.code) && err.code >= 400 && err.code < 600
        ? err.code
        : 500;
    let message = err.message || 'Internal server error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value entered';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message);
    }

    // Always log so 500s aren't silent. In production, replace with a structured logger.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode}:`, err);

    res.status(statusCode).json(Response.error(message, statusCode));
};

export default errorHandler;
