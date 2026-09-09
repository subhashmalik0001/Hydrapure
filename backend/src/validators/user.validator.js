import { z } from 'zod';
import { USER_ROLES } from '../utils/constants.js';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export const assignRoleSchema = z.object({
  user_id: z.string().uuid().optional(),
  role: z.enum([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.STATION_OPERATOR,
    USER_ROLES.FIELD_TECHNICIAN,
    USER_ROLES.VIEWER,
  ]),
  district: z.string().optional().nullable(),
  block: z.string().optional().nullable(),
  assigned_station_id: z.string().uuid().optional().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum([
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.BLOCK_OFFICER,
    USER_ROLES.STATION_OPERATOR,
    USER_ROLES.FIELD_TECHNICIAN,
    USER_ROLES.VIEWER,
  ]).default(USER_ROLES.VIEWER),
  district: z.string().optional().nullable(),
  block: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  district: z.string().optional().nullable(),
  block: z.string().optional().nullable(),
});

export const updateUserStatusSchema = z.object({
  is_active: z.boolean(),
});
