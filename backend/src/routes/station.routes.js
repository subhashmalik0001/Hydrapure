import { Router } from 'express';
import { stationController } from '../controllers/station.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { USER_ROLES } from '../utils/constants.js';
import {
  createStationSchema,
  updateStationSchema,
  stationQuerySchema,
  controlValveSchema,
} from '../validators/station.validator.js';

const router = Router();

// Public / Authenticated read routes
router.get('/', validateQuery(stationQuerySchema), stationController.listStations);
router.get('/:id', stationController.getStationById);
router.get('/:id/live', stationController.getStationLiveState);
router.get('/:id/history', stationController.getStationHistory);
router.get('/:id/alerts', stationController.getStationAlerts);

// Protected station administrative endpoints
router.post(
  '/',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateBody(createStationSchema),
  stationController.createStation
);

router.put(
  '/:id',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.DISTRICT_OFFICER),
  validateBody(updateStationSchema),
  stationController.updateStation
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  stationController.deleteStation
);

// Valve override & emergency control
router.post(
  '/:id/control',
  requireAuth,
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.STATION_OPERATOR
  ),
  validateBody(controlValveSchema),
  stationController.controlValve
);

export default router;
