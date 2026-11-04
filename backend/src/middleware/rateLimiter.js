const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 5000 : 200, // limit each IP to 200 requests per windowMs in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // If explicit rate-limit test header is sent in test mode, enforce low threshold of 3
    if (req.headers['x-test-rate-limit']) return 3;
    return isTest ? 1000 : 30; // limit login/register attempts
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

module.exports = { generalLimiter, authLimiter };
