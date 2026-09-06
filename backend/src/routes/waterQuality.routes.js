import { Router } from 'express';
import { waterQualityController } from '../controllers/waterQuality.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { USER_ROLES } from '../utils/constants.js';
import {
  waterQualityQuerySchema,
  manualMeasurementSchema,
} from '../validators/waterQuality.validator.js';

const router = Router();

router.get('/latest', validateQuery(waterQualityQuerySchema), waterQualityController.getLatest);
router.get('/history', validateQuery(waterQualityQuerySchema), waterQualityController.getTimeSeries);

router.post(
  '/manual',
  requireAuth,
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FIELD_TECHNICIAN,
    USER_ROLES.STATION_OPERATOR
  ),
  validateBody(manualMeasurementSchema),
  waterQualityController.recordManual
);

router.post('/assess', waterQualityController.assessRisk);

export default router;
