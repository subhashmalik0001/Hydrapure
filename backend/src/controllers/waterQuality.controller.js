import { waterQualityService } from '../services/waterQuality.service.js';
import { successResponse } from '../utils/response.js';

export class WaterQualityController {
  async getLatest(req, res, next) {
    try {
      const latest = await waterQualityService.getLatestMeasurements(req.query);
      return successResponse(res, latest, 'Latest water quality readings retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getTimeSeries(req, res, next) {
    try {
      const timeSeries = await waterQualityService.getTimeSeries(req.query);
      return successResponse(res, timeSeries, 'Water quality time series data retrieved');
    } catch (err) {
      next(err);
    }
  }

  async recordManual(req, res, next) {
    try {
      const record = await waterQualityService.recordManualMeasurement(req.body, req.user?.id);
      return successResponse(res, record, 'Manual water quality measurement recorded', 201);
    } catch (err) {
      next(err);
    }
  }

  async assessRisk(req, res, next) {
    try {
      const { ph, tds, turbidity, stage } = req.body;
      const assessment = waterQualityService.assessWaterSafety({ ph, tds, turbidity }, stage);
      return successResponse(res, assessment, 'Water safety and contamination risk assessed');
    } catch (err) {
      next(err);
    }
  }
}

export const waterQualityController = new WaterQualityController();
