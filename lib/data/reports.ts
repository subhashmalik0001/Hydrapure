import type { Report } from '@/lib/types'

export const reports: Report[] = [
  {
    id: 'RPT-001',
    title: 'Monthly Water Quality Report',
    type: 'Quality',
    period: 'Aug 2026',
    generatedAt: '02 Sep 2026, 10:24 AM',
    status: 'Ready',
  },
  {
    id: 'RPT-002',
    title: 'Station Performance Report',
    type: 'Performance',
    period: 'Aug 2026',
    generatedAt: '01 Sep 2026, 08:00 AM',
    status: 'Ready',
  },
  {
    id: 'RPT-003',
    title: 'Alert Summary Report',
    type: 'Alerts',
    period: 'Aug 2026',
    generatedAt: '01 Sep 2026, 08:00 AM',
    status: 'Ready',
  },
  {
    id: 'RPT-004',
    title: 'District-wise Comparison',
    type: 'Summary',
    period: 'Aug 2026',
    generatedAt: '01 Sep 2026, 08:00 AM',
    status: 'Ready',
  },
]
