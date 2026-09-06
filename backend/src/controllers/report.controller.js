import { reportService } from '../services/report.service.js';
import { successResponse } from '../utils/response.js';

export class ReportController {
  async listReports(req, res, next) {
    try {
      const reports = await reportService.listReports(req.query);
      return successResponse(res, reports, 'Reports retrieved');
    } catch (err) {
      next(err);
    }
  }

  async generateReport(req, res, next) {
    try {
      const report = await reportService.generateReport(req.body, req.user?.id);
      return successResponse(res, report, 'Report generated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await reportService.getReportById(req.params.id);
      return successResponse(res, report, 'Report retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
