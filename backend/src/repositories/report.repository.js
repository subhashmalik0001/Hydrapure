let memoryReports = [
  {
    id: 'rpt-001',
    report_code: 'RPT-2026-08-Q',
    title: 'Monthly Water Quality Compliance Dossier',
    type: 'Quality',
    period: 'Aug 2026',
    district: 'Dhanbad',
    status: 'Ready',
    file_url: '/api/v1/reports/rpt-001/download',
    created_at: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'rpt-002',
    report_code: 'RPT-2026-08-P',
    title: 'Station Throughput & Outflow Performance',
    type: 'Performance',
    period: 'Aug 2026',
    district: 'Dhanbad',
    status: 'Ready',
    file_url: '/api/v1/reports/rpt-002/download',
    created_at: '2026-09-01T11:00:00.000Z',
  },
  {
    id: 'rpt-003',
    report_code: 'RPT-2026-08-A',
    title: 'Incidents & Automated Valve Actuations Log',
    type: 'Alerts',
    period: 'Aug 2026',
    district: 'Dhanbad',
    status: 'Ready',
    file_url: '/api/v1/reports/rpt-003/download',
    created_at: '2026-09-01T12:00:00.000Z',
  },
];

export class ReportRepository {
  async findAll({ type, district, limit = 20, offset = 0 }) {
    let list = [...memoryReports];
    if (type) list = list.filter(r => r.type === type);
    if (district) list = list.filter(r => r.district === district);
    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }

  async findById(id) {
    return memoryReports.find(r => r.id === id || r.report_code === id) || null;
  }

  async create(reportData) {
    const report = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rpt-${Date.now()}`,
      report_code: `RPT-${Date.now().toString().slice(-6)}`,
      status: 'Ready',
      created_at: new Date().toISOString(),
      ...reportData,
    };
    report.file_url = `/api/v1/reports/${report.id}/download`;
    memoryReports.unshift(report);
    return report;
  }
}

export const reportRepository = new ReportRepository();
