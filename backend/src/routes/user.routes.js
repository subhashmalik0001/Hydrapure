import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { USER_ROLES } from '../utils/constants.js';
import { updateProfileSchema, assignRoleSchema } from '../validators/user.validator.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.DISTRICT_OFFICER),
  userController.listUsers
);

router.get('/:id', userController.getUserById);

router.put('/profile', validateBody(updateProfileSchema), userController.updateProfile);

router.post(
  '/role',
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateBody(assignRoleSchema),
  userController.assignRole
);

router.delete(
  '/:id',
  requireRole(USER_ROLES.SUPER_ADMIN),
  userController.deactivateUser
);

export default router;
