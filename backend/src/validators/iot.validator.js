import { z } from 'zod';
import { MEASUREMENT_STAGES } from '../utils/constants.js';

export const stageMeasurementSchema = z.object({
  ph: z.number().min(0).max(14),
  tds: z.number().min(0).max(10000),
  turbidity: z.number().min(0).max(1000),
  temperature: z.number().optional().default(25.0),
  dissolved_oxygen: z.number().optional(),
  flow_rate: z.number().optional(),
});

export const iotTelemetryPacketSchema = z.object({
  device_id: z.string().min(1, 'device_id is required'),
  station_id: z.string().uuid().optional(),
  sequence_number: z.number().int().nonnegative().optional().default(0),
  timestamp: z.string().optional(),
  
  // Either direct flat fields or dual raw/treated blocks
  raw: stageMeasurementSchema.partial().optional(),
  treated: stageMeasurementSchema.partial().optional(),

  // Or flat values for treated
  ph: z.number().min(0).max(14).optional(),
  tds: z.number().min(0).max(10000).optional(),
  turbidity: z.number().min(0).max(1000).optional(),
  temperature: z.number().optional(),
  flow_rate: z.number().optional(),
  dissolved_oxygen: z.number().optional(),
  stage: z.nativeEnum(MEASUREMENT_STAGES).optional().default(MEASUREMENT_STAGES.TREATED),

  // Diagnostics & Hardware state
  battery_level: z.number().min(0).max(100).optional(),
  solar_voltage: z.number().min(0).optional(),
  rssi: z.number().optional(),
  error_flags: z.array(z.string()).optional().default([]),
});

export const iotBatchTelemetrySchema = z.object({
  device_id: z.string().min(1),
  batch_id: z.string().optional(),
  sent_at: z.string().optional(),
  packets: z.array(iotTelemetryPacketSchema).min(1, 'Packets array cannot be empty'),
});

export const iotHeartbeatSchema = z.object({
  device_id: z.string().min(1),
  uptime_seconds: z.number().nonnegative().optional(),
  battery_percentage: z.number().min(0).max(100).optional(),
  solar_voltage: z.number().min(0).optional(),
  signal_strength_dbm: z.number().optional(),
  firmware_version: z.string().optional(),
  error_code: z.string().optional(),
  current_valve_status: z.string().optional(),
});
