import { maintenanceService } from '../services/maintenance.service.js';
import { successResponse } from '../utils/response.js';

export class MaintenanceController {
  async listLogs(req, res, next) {
    try {
      const logs = await maintenanceService.listLogs(req.query);
      return successResponse(res, logs, 'Maintenance logs retrieved');
    } catch (err) {
      next(err);
    }
  }

  async schedule(req, res, next) {
    try {
      const log = await maintenanceService.scheduleMaintenance(req.body, req.user?.id);
      return successResponse(res, log, 'Maintenance work order scheduled', 201);
    } catch (err) {
      next(err);
    }
  }

  async complete(req, res, next) {
    try {
      const log = await maintenanceService.completeMaintenance(req.params.id, req.body, req.user?.id);
      return successResponse(res, log, 'Maintenance work marked as completed');
    } catch (err) {
      next(err);
    }
  }
}

export const maintenanceController = new MaintenanceController();
