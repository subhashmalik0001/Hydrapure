import { dashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.js';

export class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getOverviewSummary(req.query.district);
      return successResponse(res, summary, 'Dashboard overview metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getMapStations(req, res, next) {
    try {
      const mapData = await dashboardService.getMapData(req.query.district);
      return successResponse(res, mapData, 'Map station coordinates and live states retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getRegionalBreakdown(req, res, next) {
    try {
      const breakdown = await dashboardService.getDistrictBreakdown();
      return successResponse(res, breakdown, 'Regional district breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
