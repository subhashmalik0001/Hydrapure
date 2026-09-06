import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { USER_ROLES } from '../utils/constants.js';

const router = Router();

router.use(requireAuth);

router.get('/', reportController.listReports);
router.get('/:id', reportController.getReportById);

router.post(
  '/',
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.DISTRICT_OFFICER),
  reportController.generateReport
);

export default router;
