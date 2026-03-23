import crypto from 'crypto';

/**
 * Generates a 6-digit random number as OTP
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export default generateOtp;
