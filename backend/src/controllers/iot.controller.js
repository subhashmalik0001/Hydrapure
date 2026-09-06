import { iotService } from '../services/iot.service.js';
import { successResponse } from '../utils/response.js';

export class IoTController {
  async ingestTelemetry(req, res, next) {
    try {
      const payload = req.body;
      const device = req.device;
      const station = req.station;

      const result = await iotService.processTelemetry(payload, device, station);
      
      return successResponse(res, result, 'Telemetry ingested and evaluated', 201);
    } catch (err) {
      next(err);
    }
  }

  async ingestBatch(req, res, next) {
    try {
      const { packets } = req.body;
      const device = req.device;
      const station = req.station;

      const result = await iotService.processBatchTelemetry(packets, device, station);

      return successResponse(res, result, `Processed ${result.processed_count} packets (${result.skipped_duplicates} duplicate skipped)`, 201);
    } catch (err) {
      next(err);
    }
  }

  async heartbeat(req, res, next) {
    try {
      const result = await iotService.recordHeartbeat(req.body, req.device, req.station);
      return successResponse(res, result, 'Heartbeat recorded');
    } catch (err) {
      next(err);
    }
  }

  async getCommands(req, res, next) {
    try {
      const device = req.device;
      const pendingCommands = await iotService.getPendingCommands(device.id);
      return successResponse(res, { commands: pendingCommands }, 'Pending hardware commands');
    } catch (err) {
      next(err);
    }
  }
}

export const iotController = new IoTController();
