import { z } from 'zod';
import { USER_ROLES } from '../utils/constants.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.nativeEnum(USER_ROLES).optional().default(USER_ROLES.VIEWER),
  district: z.string().optional(),
  block: z.string().optional(),
  assigned_station_id: z.string().uuid().optional().nullable(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});
