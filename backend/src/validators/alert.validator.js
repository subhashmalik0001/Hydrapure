import { z } from 'zod';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../utils/constants.js';

export const alertQuerySchema = z.object({
  station_id: z.string().uuid().optional(),
  severity: z.nativeEnum(ALERT_SEVERITIES).optional(),
  status: z.nativeEnum(ALERT_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const acknowledgeAlertSchema = z.object({
  note: z.string().optional(),
});

export const resolveAlertSchema = z.object({
  resolution_notes: z.string().min(3, 'Resolution details are required to close an alert'),
});
