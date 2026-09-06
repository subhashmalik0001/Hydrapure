import { reportRepository } from '../repositories/report.repository.js';
import { stationRepository } from '../repositories/station.repository.js';
import { waterQualityRepository } from '../repositories/waterQuality.repository.js';
import { alertRepository } from '../repositories/alert.repository.js';
import { NotFoundError } from '../utils/errors.js';

export class ReportService {
  async getReports(filters) {
    return reportRepository.findAll(filters);
  }

  async getReportById(id) {
    const report = await reportRepository.findById(id);
    if (!report) {
      throw new NotFoundError(`Report '${id}'`);
    }
    return report;
  }

  async generateReport({ type, period, district, stationId }, user) {
    const report = await reportRepository.create({
      title: `${type} Audit Report — ${period || 'Current Period'}`,
      type: type || 'Quality',
      period: period || 'Monthly',
      district: district || 'Dhanbad',
      station_id: stationId || null,
      generated_by: user?.id,
    });
    return report;
  }

  async generateDownloadText(id) {
    const report = await this.getReportById(id);
    const stations = await stationRepository.findAll({ limit: 50 });
    const alerts = await alertRepository.findAll({ limit: 10 });
    const averages = await waterQualityRepository.getAverages();

    return `====================================================================
HYDRAPURE SMART WATER PURIFICATION & QUALITY AUDIT DOSSIER
====================================================================
Report Code : ${report.report_code || report.id}
Title       : ${report.title}
Category    : ${report.type}
Period      : ${report.period}
District    : ${report.district || 'State-wide'}
Issued At   : ${new Date().toISOString()}
Compliance  : BIS IS 10500:2012 Drinking Water Specification

EXECUTIVE METRIC SUMMARY:
--------------------------------------------------------------------
Total Stations Monitored : ${stations.total}
State Average pH         : ${averages.avgPh}
State Average TDS        : ${averages.avgTds} ppm
State Average Turbidity  : ${averages.avgTurbidity} NTU
Cumulative Outflow       : ${averages.avgFlow} L/s

RECENT INCIDENTS & SOLENOID ACTUATIONS:
--------------------------------------------------------------------
${alerts.data.map(a => `[${a.triggered_at}] ${a.severity}: ${a.station_name || 'Station'} - ${a.message} (Status: ${a.status})`).join('\n')}

CERTIFICATION:
--------------------------------------------------------------------
Generated autonomously by HydraPure IoT Telemetry Engine.
Approved for administrative filing with SWSM and Jal Jeevan Mission.
====================================================================`;
  }
}

export const reportService = new ReportService();
