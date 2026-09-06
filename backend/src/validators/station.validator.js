import { z } from 'zod';
import { STATION_STATUSES, OPERATIONAL_STATUSES } from '../utils/constants.js';

export const createStationSchema = z.object({
  name: z.string().min(3, 'Station name must be at least 3 characters'),
  code: z.string().min(2, 'Station code must be at least 2 characters').toUpperCase(),
  district: z.string().min(2, 'District is required'),
  block: z.string().min(2, 'Block is required'),
  panchayat: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  capacity_liters_per_day: z.number().positive().optional().default(10000),
  primary_contamination_type: z.string().optional().default('COAL_DUST_SEDIMENT'),
  installation_date: z.string().optional(),
});

export const updateStationSchema = createStationSchema.partial().extend({
  status: z.nativeEnum(STATION_STATUSES).optional(),
  operational_status: z.nativeEnum(OPERATIONAL_STATUSES).optional(),
  valve_override: z.boolean().optional(),
  valve_override_reason: z.string().optional(),
});

export const stationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  district: z.string().optional(),
  status: z.string().optional(),
  operational_status: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const controlValveSchema = z.object({
  action: z.enum(['OPEN_SAFE_VALVE', 'CLOSE_SAFE_VALVE', 'BLOCK_SUPPLY', 'RESTORE_SUPPLY']),
  reason: z.string().min(3, 'Reason for valve override is required'),
});
