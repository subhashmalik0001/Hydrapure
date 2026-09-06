import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { USER_ROLES } from '../utils/constants.js';

const router = Router();

router.use(requireAuth);

router.get('/', maintenanceController.listLogs);

router.post(
  '/',
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.FIELD_TECHNICIAN
  ),
  maintenanceController.schedule
);

router.post(
  '/:id/complete',
  requireRole(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FIELD_TECHNICIAN,
    USER_ROLES.STATION_OPERATOR
  ),
  maintenanceController.complete
);

export default router;
