import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let ioInstance = null;

/**
 * Initialize Socket.IO server with HTTP server
 */
export function initSocketIO(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific station channel for live telemetry
    socket.on('subscribe:station', (stationId) => {
      if (stationId) {
        socket.join(`station:${stationId}`);
        logger.debug(`[Socket.IO] ${socket.id} joined station:${stationId}`);
      }
    });

    socket.on('unsubscribe:station', (stationId) => {
      if (stationId) {
        socket.leave(`station:${stationId}`);
      }
    });

    // Join global or district alerts
    socket.on('subscribe:alerts', (district) => {
      if (district) {
        socket.join(`alerts:${district.toLowerCase()}`);
      }
      socket.join('alerts:all');
    });

    // Join dashboard summary updates
    socket.on('subscribe:dashboard', () => {
      socket.join('dashboard:updates');
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
}

/**
 * Get active Socket.IO server instance
 */
export function getIO() {
  return ioInstance;
}

/**
 * Broadcast live telemetry to clients subscribed to station
 */
export function broadcastTelemetry(stationId, telemetry) {
  if (!ioInstance) return;
  ioInstance.to(`station:${stationId}`).emit('telemetry:new', telemetry);
  ioInstance.to('dashboard:updates').emit('telemetry:latest', {
    station_id: stationId,
    timestamp: telemetry.timestamp || new Date().toISOString(),
    stage: telemetry.stage,
    ph: telemetry.ph,
    tds: telemetry.tds,
    turbidity: telemetry.turbidity,
  });
}

/**
 * Broadcast critical alert to dashboard and regional subscribers
 */
export function broadcastAlert(alert) {
  if (!ioInstance) return;
  ioInstance.to('alerts:all').emit('alert:new', alert);
  if (alert.district) {
    ioInstance.to(`alerts:${alert.district.toLowerCase()}`).emit('alert:new', alert);
  }
}

/**
 * Broadcast generic system event
 */
export function broadcastEvent(event, data) {
  if (!ioInstance) return;
  ioInstance.emit(event, data);
}

/**
 * Broadcast valve command / state change
 */
export function broadcastValveChange(stationId, valveData) {
  if (!ioInstance) return;
  ioInstance.to(`station:${stationId}`).emit('valve:updated', valveData);
}

