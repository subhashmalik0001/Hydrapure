import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { initSocketIO } from './sockets/socket.js';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs/index.js';
import { checkDatabaseConnection } from './config/database.js';

const server = http.createServer(app);

// Initialize WebSockets for real-time telemetry and alerts
const io = initSocketIO(server);

// Start HTTP Server
const PORT = env.PORT || 5000;

server.listen(PORT, async () => {
  logger.info(`=======================================================`);
  logger.info(`  HydraPure Smart Water Purification Backend Service   `);
  logger.info(`  Port:             ${PORT}`);
  logger.info(`  Environment:      ${env.NODE_ENV}`);
  logger.info(`  Swagger Docs:     http://localhost:${PORT}/api-docs`);
  logger.info(`  Health Check:     http://localhost:${PORT}/api/v1/health`);
  logger.info(`  WebSocket:        Active (Socket.IO)`);
  logger.info(`=======================================================`);

  // Verify Supabase connectivity
  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    logger.info('[Database] Supabase connection established successfully');
  } else {
    logger.warn('[Database] Running in offline / mock-resilient mode');
  }

  // Start automated cron watchdog jobs
  if (env.NODE_ENV !== 'test') {
    startBackgroundJobs();
  }
});

// Graceful Shutdown Handlers
function handleGracefulShutdown(signal) {
  logger.info(`[Process] Received ${signal}. Starting graceful shutdown...`);

  stopBackgroundJobs();

  if (io) {
    io.close(() => {
      logger.info('[Socket.IO] All client connections closed');
    });
  }

  server.close((err) => {
    if (err) {
      logger.error('[Server] Error during shutdown:', err);
      process.exit(1);
    }
    logger.info('[Server] HTTP server closed gracefully. Exiting process.');
    process.exit(0);
  });

  // Force exit if hanging after 10s
  setTimeout(() => {
    logger.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Process] Unhandled Promise Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('[Process] Uncaught Exception:', error);
  process.exit(1);
});

export { server, app };
