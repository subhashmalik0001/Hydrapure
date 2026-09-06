import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
}

/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Internal server error occurred';
  let code = 'INTERNAL_ERROR';
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';
    details = err.details || null;
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    // Malformed JSON payload
    statusCode = 400;
    message = 'Malformed JSON request body';
    code = 'INVALID_JSON';
  } else if (err.code === '23505') {
    // PostgreSQL Unique Violation
    statusCode = 409;
    message = 'A resource with this identifier already exists';
    code = 'CONFLICT';
  } else if (err.code === '23503') {
    // PostgreSQL Foreign Key Violation
    statusCode = 400;
    message = 'Foreign key constraint violated';
    code = 'FOREIGN_KEY_VIOLATION';
  }

  // Log full error details for server diagnostics
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  const response = {
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(response);
}
