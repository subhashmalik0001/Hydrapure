import { Router } from 'express';
import { alertController } from '../controllers/alert.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { USER_ROLES } from '../utils/constants.js';
import {
  alertQuerySchema,
  acknowledgeAlertSchema,
  resolveAlertSchema,
} from '../validators/alert.validator.js';

const router = Router();

router.get('/', validateQuery(alertQuerySchema), alertController.listAlerts);
router.get('/stats', alertController.getAlertStats);
router.get('/:id', alertController.getAlertById);

router.post(
  '/:id/acknowledge',
  requireAuth,
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.STATION_OPERATOR,
    USER_ROLES.FIELD_TECHNICIAN
  ),
  validateBody(acknowledgeAlertSchema),
  alertController.acknowledgeAlert
);

router.post(
  '/:id/resolve',
  requireAuth,
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.STATION_OPERATOR
  ),
  validateBody(resolveAlertSchema),
  alertController.resolveAlert
);

export default router;
