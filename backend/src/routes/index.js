import { Router } from 'express';
import authRoutes from './auth.routes.js';
import stationRoutes from './station.routes.js';
import waterQualityRoutes from './waterQuality.routes.js';
import alertRoutes from './alert.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import iotRoutes from './iot.routes.js';
import reportRoutes from './report.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import userRoutes from './user.routes.js';
import { healthController } from '../controllers/health.controller.js';

const apiRouter = Router();

// Health Check Endpoint
apiRouter.get('/health', healthController.getHealth);

// Versioned resource routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/stations', stationRoutes);
apiRouter.use('/quality', waterQualityRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/iot', iotRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/maintenance', maintenanceRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
