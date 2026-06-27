const rateLimit = require('express-rate-limit');

// Maximum 5 requests per hour per IP for Forgot Password API
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many password reset requests from this IP, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Maximum 10 requests per hour per IP for OTP Verify API
const verifyOTPLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many OTP verification attempts from this IP, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  forgotPasswordLimiter,
  verifyOTPLimiter
};
