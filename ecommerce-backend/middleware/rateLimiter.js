const rateLimit = require('express-rate-limit');

/**
 * Rate limiting for authentication endpoints.
 *
 * Design notes:
 *  - Keyed by IP address (express-rate-limit's default) rather than by
 *    email/username, so an attacker can't dodge the limit by trying many
 *    different emails from the same machine.
 *  - Returns a generic, safe error message on both customer and admin
 *    limiters — never reveals whether the limit was hit because of a
 *    specific username, and never distinguishes "wrong password" from
 *    "account doesn't exist" (that distinction is handled in the
 *    controllers themselves, not here — this file only handles the
 *    request-count limiting).
 *  - `standardHeaders: true` sends RateLimit-* headers so legitimate
 *    clients (and you, while testing) can see remaining attempts.
 *  - `legacyHeaders: false` disables the older X-RateLimit-* headers to
 *    avoid duplicate header noise.
 */

// Customer login: a bit more lenient since typos/forgotten passwords are
// common and customers aren't a high-value target individually.
const customerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  },
});

// Admin login: stricter, since only 4 accounts exist and they control
// the entire catalog/order system. Also applies to any future
// admin-only authentication endpoints.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  },
});

// General-purpose limiter for the contact form, to prevent it being used
// as a spam/flood vector against the database (requirement 9: real
// storage means this is now a genuine write endpoint, not a no-op).
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent. Please try again later.',
  },
});

module.exports = {
  customerLoginLimiter,
  adminLoginLimiter,
  contactFormLimiter,
};