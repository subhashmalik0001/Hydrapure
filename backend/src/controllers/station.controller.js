import { stationService } from '../services/station.service.js';
import { successResponse } from '../utils/response.js';

export class StationController {
  async listStations(req, res, next) {
    try {
      const { stations, pagination } = await stationService.listStations(req.query);
      return successResponse(res, stations, 'Water purification stations retrieved', 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getStationById(req, res, next) {
    try {
      const station = await stationService.getStationById(req.params.id);
      return successResponse(res, station, 'Station details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getStationLiveState(req, res, next) {
    try {
      const liveState = await stationService.getStationLiveState(req.params.id);
      return successResponse(res, liveState, 'Station live metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createStation(req, res, next) {
    try {
      const station = await stationService.createStation(req.body, req.user?.id);
      return successResponse(res, station, 'New purification station registered', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStation(req, res, next) {
    try {
      const station = await stationService.updateStation(req.params.id, req.body, req.user?.id);
      return successResponse(res, station, 'Station configuration updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteStation(req, res, next) {
    try {
      await stationService.deleteStation(req.params.id, req.user?.id);
      return successResponse(res, { id: req.params.id }, 'Station decommissioned/removed');
    } catch (err) {
      next(err);
    }
  }

  async controlValve(req, res, next) {
    try {
      const { action, reason } = req.body;
      const result = await stationService.controlValve(req.params.id, action, reason, req.user?.id);
      return successResponse(res, result, `Valve command '${action}' executed successfully`);
    } catch (err) {
      next(err);
    }
  }

  async getStationHistory(req, res, next) {
    try {
      const { history, pagination } = await stationService.getStationHistory(req.params.id, req.query);
      return successResponse(res, history, 'Station historical logs retrieved', 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getStationAlerts(req, res, next) {
    try {
      const alerts = await stationService.getStationAlerts(req.params.id, req.query);
      return successResponse(res, alerts, 'Station alerts retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const stationController = new StationController();
