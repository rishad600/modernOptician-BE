import rateLimit from 'express-rate-limit';
import Response from '../utils/response.js';

const limitResponse = (req, res) => {
    return res.status(429).json(Response.error('Too many requests. Please try again later.', 429));
};

// Strict limiter for credential-sensitive endpoints (login, register, OTP request, OTP verify).
// 10 attempts per 15 minutes per IP. Tighten further once a per-account counter is in place.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limitResponse,
});

// Looser limiter for general write endpoints to blunt scraping/abuse.
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limitResponse,
});
