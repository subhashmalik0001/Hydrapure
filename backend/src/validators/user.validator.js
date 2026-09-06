import { z } from 'zod';
import { USER_ROLES } from '../utils/constants.js';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export const assignRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.nativeEnum(USER_ROLES),
  district: z.string().optional(),
  block: z.string().optional(),
  assigned_station_id: z.string().uuid().optional().nullable(),
});
