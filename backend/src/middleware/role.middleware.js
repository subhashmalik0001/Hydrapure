import { USER_ROLES } from '../utils/constants.js';
import { ForbiddenError } from '../utils/errors.js';

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles Roles authorized to access this resource
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User context not initialized'));
    }

    const userRole = req.user.role || USER_ROLES.VIEWER;

    // SUPER_ADMIN always bypasses role checks
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(`Access denied. Role '${userRole}' does not have required permissions`)
      );
    }

    next();
  };
}

/**
 * Scope enforcement: checks if an officer is assigned to the requested district/station
 */
export function requireRegionalScope(req, res, next) {
  const user = req.user;
  if (!user) {
    return next(new ForbiddenError('Authentication required'));
  }

  // Super Admins & State Admins have state-wide access
  if ([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(user.role)) {
    return next();
  }

  const requestedDistrict = req.query.district || req.body.district;
  if (user.district && requestedDistrict && user.district.toLowerCase() !== requestedDistrict.toLowerCase()) {
    return next(
      new ForbiddenError(`Operation outside assigned district scope: ${user.district}`)
    );
  }

  next();
}
