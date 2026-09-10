import rateLimit from 'express-rate-limit';
import { env } from './env.js';

const isDev = env.NODE_ENV === 'development';
const noop = (_req, _res, next) => next();

export const generalLimiter = isDev ? noop : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `admin:${req.ip}`,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
});

export const authLimiter = isDev ? noop : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `auth:${req.ip}`,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts, please try again later' } },
});

export const publicLimiter = isDev ? noop : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `public:${req.ip}`,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
});

export const publicOrderLimiter = isDev ? noop : rateLimit({
  windowMs: 60000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `order:${req.ip}`,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many orders, please try again later' } },
});

// A 4-digit PIN is only 10,000 combinations. Under the general public limiter
// (300 per 15 min) that is exhaustible in hours from one IP, and far faster
// from several. This caps attempts hard; a real kitchen tablet types the PIN
// once per shift, so the limit is invisible in normal use.
export const kitchenPinLimiter = isDev ? noop : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many PIN attempts. Try again later.' } },
});

// The superadmin-only reset endpoint is gated by a shared secret. Without a
// limiter that secret could be guessed at request speed by anyone holding a
// superadmin token. Resets are rare; five per window is generous.
export const sensitiveAdminLimiter = isDev ? noop : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Try again later.' } },
});
