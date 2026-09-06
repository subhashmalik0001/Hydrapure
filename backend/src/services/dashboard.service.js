import { stationRepository } from '../repositories/station.repository.js';
import { alertRepository } from '../repositories/alert.repository.js';
import { waterQualityRepository } from '../repositories/waterQuality.repository.js';

export class DashboardService {
  async getSummary(district) {
    const stationCounts = await stationRepository.getCounts();
    const alertCounts = await alertRepository.getCounts();
    const averages = await waterQualityRepository.getAverages();

    // Fetch top recent alerts
    const { data: recentAlerts } = await alertRepository.findAll({ limit: 5 });

    // Fetch live stations sample
    const { data: stationList } = await stationRepository.findAll({ district, limit: 10 });

    const safePercentage =
      stationCounts.total > 0 ? Math.round((stationCounts.safe / stationCounts.total) * 100) : 100;

    return {
      totalStations: stationCounts.total,
      safe: stationCounts.safe,
      caution: stationCounts.caution,
      blocked: stationCounts.blocked,
      offline: stationCounts.offline,
      safePercentage,
      householdsCovered: stationCounts.households || 2720,
      litersPurifiedToday: 142500,
      activeAlerts: alertCounts.total - alertCounts.resolved,
      criticalAlerts: alertCounts.critical,
      averages,
      recentAlerts,
      stations: stationList,
      lastSync: new Date().toISOString(),
    };
  }

  async getOverviewSummary(district) {
    return this.getSummary(district);
  }

  async getMapData(district) {
    const { data: stations } = await stationRepository.findAll({ district, limit: 100 });

    return {
      type: 'FeatureCollection',
      features: stations.map((s) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [s.longitude, s.latitude],
        },
        properties: {
          id: s.id,
          name: s.name,
          code: s.station_code || s.code,
          district: s.district,
          block: s.block,
          status: s.status,
          operational_status: s.operational_status,
          connectivity_status: s.connectivity_status,
          last_seen_at: s.last_seen_at,
        },
      })),
      stations,
    };
  }

  async getDistrictBreakdown() {
    const { data: allStations } = await stationRepository.findAll({ limit: 500 });
    const districts = {};

    for (const station of allStations) {
      const dist = station.district || 'Dhanbad';
      if (!districts[dist]) {
        districts[dist] = {
          district: dist,
          totalStations: 0,
          safeStations: 0,
          cautionStations: 0,
          blockedStations: 0,
          offlineStations: 0,
        };
      }

      districts[dist].totalStations++;
      if (station.status === 'SAFE') districts[dist].safeStations++;
      else if (station.status === 'CAUTION') districts[dist].cautionStations++;
      else if (station.status === 'BLOCKED') districts[dist].blockedStations++;
      else if (station.status === 'OFFLINE') districts[dist].offlineStations++;
    }

    return Object.values(districts);
  }
}

export const dashboardService = new DashboardService();
