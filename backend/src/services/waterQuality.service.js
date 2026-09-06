import { waterQualityRepository } from '../repositories/waterQuality.repository.js';
import { stationRepository } from '../repositories/station.repository.js';

export class WaterQualityService {
  async getReadings(filters) {
    return waterQualityRepository.findReadings(filters);
  }

  async getLatestReadingsForAllStations() {
    const { data: stations } = await stationRepository.findAll({ limit: 100 });
    const results = [];

    for (const s of stations) {
      const reading = await waterQualityRepository.getLatestReading(s.id, 'TREATED');
      results.push({
        stationId: s.id,
        stationCode: s.station_code,
        stationName: s.name,
        district: s.district,
        status: s.status,
        reading: reading || null,
      });
    }

    return results;
  }

  async getTrends(stationId, range = '24H', parameter = 'tds') {
    // Return aggregated time-series data
    const { data } = await waterQualityRepository.findReadings({ stationId, limit: 100 });
    return {
      range,
      parameter,
      dataPoints: data.map(r => ({
        time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: r.recorded_at,
        value: r[parameter.toLowerCase()] || 0,
        stage: r.measurement_stage,
      })),
    };
  }

  async getSummary() {
    const averages = await waterQualityRepository.getAverages();
    const thresholds = await waterQualityRepository.getThresholds();
    return {
      averages,
      thresholds,
      standardCompliance: 'BIS IS 10500:2012 Guidelines',
    };
  }

  async getThresholds() {
    return waterQualityRepository.getThresholds();
  }

  async updateThreshold(id, updates) {
    return waterQualityRepository.updateThreshold(id, updates);
  }
}

export const waterQualityService = new WaterQualityService();
