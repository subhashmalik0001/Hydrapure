import { alertService } from '../services/alert.service.js';
import { successResponse } from '../utils/response.js';

export class AlertController {
  async listAlerts(req, res, next) {
    try {
      const { alerts, pagination } = await alertService.listAlerts(req.query);
      return successResponse(res, alerts, 'System alerts retrieved', 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getAlertById(req, res, next) {
    try {
      const alert = await alertService.getAlertById(req.params.id);
      return successResponse(res, alert, 'Alert details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async acknowledgeAlert(req, res, next) {
    try {
      const { note } = req.body;
      const alert = await alertService.acknowledgeAlert(req.params.id, req.user?.id, note);
      return successResponse(res, alert, 'Alert marked as acknowledged');
    } catch (err) {
      next(err);
    }
  }

  async resolveAlert(req, res, next) {
    try {
      const { resolution_notes } = req.body;
      const alert = await alertService.resolveAlert(req.params.id, req.user?.id, resolution_notes);
      return successResponse(res, alert, 'Alert resolved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getAlertStats(req, res, next) {
    try {
      const stats = await alertService.getAlertSummary();
      return successResponse(res, stats, 'Alert metrics and breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const alertController = new AlertController();
