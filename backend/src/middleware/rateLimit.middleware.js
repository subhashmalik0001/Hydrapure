import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Standard API rate limiter for general requests
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Stricter rate limiter for authentication endpoints to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * High-throughput IoT telemetry rate limiter (keyed by IP or X-Device-Id)
 */
export const iotTelemetryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 180, // up to 3 telemetry packets per second sustained
  keyGenerator: (req) => req.headers['x-device-id'] || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Telemetry ingestion rate limit exceeded for device.',
      code: 'IOT_RATE_LIMIT_EXCEEDED',
    },
  },
});
