import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';
import { swaggerDocument } from './docs/swagger.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Swagger UI assets
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, ESP32)
      if (!origin) return callback(null, true);
      const allowedOrigins = Array.isArray(env.CORS_ORIGINS) 
        ? env.CORS_ORIGINS 
        : (env.CORS_ORIGINS || '').split(',').map((o) => o.trim());
      if (
        allowedOrigins.includes('*') || 
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Device-Id',
      'X-Device-Key',
      'X-Requested-With',
    ],
  })
);

// Payload parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// HTTP Request Logger
app.use(requestLogger);

// Global standard rate limiter
app.use('/api/', apiLimiter);

// API Documentation via Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount Versioned API Routes
app.use('/api/v1', apiRouter);

// Service Root Welcome & Meta Information
app.get('/', (req, res) => {
  res.json({
    service: 'HydraPure Smart Water Purification Backend API',
    version: '1.0.0',
    status: 'OPERATIONAL',
    documentation: '/api-docs',
    health: '/api/v1/health',
    endpoints: {
      auth: '/api/v1/auth',
      stations: '/api/v1/stations',
      waterQuality: '/api/v1/quality',
      alerts: '/api/v1/alerts',
      dashboard: '/api/v1/dashboard',
      iot: '/api/v1/iot',
      reports: '/api/v1/reports',
      maintenance: '/api/v1/maintenance',
      users: '/api/v1/users',
    },
  });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
