import winston from 'winston';
import { sanitizeLogData } from './helpers.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

const customConsoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const sanitizedMeta = sanitizeLogData(metadata);
  const metaString = Object.keys(sanitizedMeta).length ? ` | ${JSON.stringify(sanitizedMeta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaString}`;
});

const isProd = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format(info => {
      // Automatic recursive sanitization on log arguments
      return sanitizeLogData(info);
    })()
  ),
  transports: [
    new winston.transports.Console({
      format: isProd
        ? json()
        : combine(colorize(), customConsoleFormat),
    }),
  ],
});
