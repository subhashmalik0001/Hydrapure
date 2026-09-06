import { logger } from '../utils/logger.js';

/**
 * HTTP Request Logging Middleware
 * Records request latency and response codes
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Intercept finish event to log complete transaction
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip}]`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });

  next();
}
