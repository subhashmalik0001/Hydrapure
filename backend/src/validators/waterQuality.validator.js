import { z } from 'zod';
import { MEASUREMENT_STAGES } from '../utils/constants.js';

export const waterQualityQuerySchema = z.object({
  station_id: z.string().uuid().optional(),
  stage: z.nativeEnum(MEASUREMENT_STAGES).optional(),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(500).optional().default(50),
});

export const manualMeasurementSchema = z.object({
  station_id: z.string().uuid(),
  stage: z.nativeEnum(MEASUREMENT_STAGES).default(MEASUREMENT_STAGES.TREATED),
  ph: z.number().min(0).max(14),
  tds: z.number().min(0).max(5000),
  turbidity: z.number().min(0).max(100),
  temperature: z.number().min(-10).max(60).optional().default(25.0),
  dissolved_oxygen: z.number().min(0).max(20).optional().default(6.5),
  flow_rate: z.number().min(0).optional().default(12.5),
  notes: z.string().optional(),
});
