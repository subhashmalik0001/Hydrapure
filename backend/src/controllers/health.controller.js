import { checkDatabaseConnection } from '../config/database.js';
import { env } from '../config/env.js';
import { successResponse } from '../utils/response.js';

export class HealthController {
  async getHealth(req, res, next) {
    try {
      const dbConnected = await checkDatabaseConnection();
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();

      const health = {
        service: 'HydraPure Backend API',
        status: dbConnected ? 'HEALTHY' : 'DEGRADED',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor(uptime),
        environment: env.NODE_ENV,
        database: {
          connected: dbConnected,
          type: 'PostgreSQL / Supabase',
        },
        memory: {
          rss_mb: Math.round(memUsage.rss / 1024 / 1024),
          heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        },
      };

      const statusCode = dbConnected ? 200 : 503;
      return successResponse(res, health, 'Health check completed', statusCode);
    } catch (err) {
      next(err);
    }
  }
}

export const healthController = new HealthController();
