import { Router } from 'express';
import { iotController } from '../controllers/iot.controller.js';
import { requireDeviceAuth } from '../middleware/deviceAuth.middleware.js';
import { iotTelemetryLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  iotTelemetryPacketSchema,
  iotBatchTelemetrySchema,
  iotHeartbeatSchema,
} from '../validators/iot.validator.js';

const router = Router();

// Hardware authenticated ingestion routes
router.post(
  '/telemetry',
  iotTelemetryLimiter,
  requireDeviceAuth,
  validateBody(iotTelemetryPacketSchema),
  iotController.ingestTelemetry
);

router.post(
  '/telemetry/batch',
  iotTelemetryLimiter,
  requireDeviceAuth,
  validateBody(iotBatchTelemetrySchema),
  iotController.ingestBatch
);

router.post(
  '/heartbeat',
  requireDeviceAuth,
  validateBody(iotHeartbeatSchema),
  iotController.heartbeat
);

router.get(
  '/commands',
  requireDeviceAuth,
  iotController.getCommands
);

export default router;
