import type { Alert } from '@/lib/types'

export const alerts: Alert[] = [
  {
    id: 'ALT-001', level: 'critical', stationId: 'WS-003', stationName: 'Baghmara', district: 'Dhanbad',
    parameter: 'TDS', title: 'High TDS detected (1500 ppm)', message: 'Supply blocked automatically',
    value: 1500, threshold: 500, unit: 'ppm',
    timestamp: '10:15 AM', timestampFull: '02 Sep 2026, 10:15 AM',
    resolved: false, actionTaken: 'Automatic valve closed', notifiedTo: 'Block Officer / Jal Prabandhan Department',
  },
  {
    id: 'ALT-002', level: 'warning', stationId: 'WS-004', stationName: 'Katras', district: 'Dhanbad',
    parameter: 'Turbidity', title: 'Turbidity above limit — Katras', message: 'Under caution',
    value: 4.5, threshold: 5.0, unit: 'NTU',
    timestamp: '09:42 AM', timestampFull: '02 Sep 2026, 09:42 AM',
    resolved: false, actionTaken: 'Monitoring increased',
  },
  {
    id: 'ALT-003', level: 'resolved', stationId: 'WS-002', stationName: 'Govindpur', district: 'Dhanbad',
    parameter: 'System', title: 'System back online — Govindpur', message: 'Water quality normal',
    timestamp: '08:30 AM', timestampFull: '02 Sep 2026, 08:30 AM',
    resolved: true,
  },
  {
    id: 'ALT-004', level: 'warning', stationId: 'WS-006', stationName: 'Sindri', district: 'Dhanbad',
    parameter: 'pH', title: 'Low pH detected — Sindri', message: 'Under monitoring',
    value: 6.4, threshold: 6.5, unit: 'pH',
    timestamp: '07:18 AM', timestampFull: '02 Sep 2026, 07:18 AM',
    resolved: false,
  },
  {
    id: 'ALT-005', level: 'critical', stationId: 'WS-013', stationName: 'Barhi', district: 'Hazaribagh',
    parameter: 'TDS', title: 'High TDS detected (1420 ppm)', message: 'Supply blocked automatically',
    value: 1420, threshold: 500, unit: 'ppm',
    timestamp: '10:05 AM', timestampFull: '02 Sep 2026, 10:05 AM',
    resolved: false, actionTaken: 'Automatic valve closed', notifiedTo: 'Block Officer / Jal Prabandhan Department',
  },
  {
    id: 'ALT-006', level: 'warning', stationId: 'WS-008', stationName: 'Baliapur', district: 'Dhanbad',
    parameter: 'Turbidity', title: 'Turbidity rising — Baliapur', message: 'Treatment adjustment needed',
    value: 6.2, threshold: 5.0, unit: 'NTU',
    timestamp: '09:15 AM', timestampFull: '02 Sep 2026, 09:15 AM',
    resolved: false,
  },
  {
    id: 'ALT-007', level: 'info', stationId: 'WS-001', stationName: 'Jharia', district: 'Dhanbad',
    parameter: 'System', title: 'Scheduled maintenance completed', message: 'All systems operational',
    timestamp: '06:00 AM', timestampFull: '02 Sep 2026, 06:00 AM',
    resolved: true,
  },
  {
    id: 'ALT-008', level: 'info', stationId: 'WS-009', stationName: 'Kanke', district: 'Ranchi',
    parameter: 'Connectivity', title: 'Connectivity restored — Kanke', message: 'Network stable',
    timestamp: '05:45 AM', timestampFull: '02 Sep 2026, 05:45 AM',
    resolved: true,
  },
  {
    id: 'ALT-009', level: 'warning', stationId: 'WS-015', stationName: 'Latehar', district: 'Latehar',
    parameter: 'TDS', title: 'Elevated TDS — Latehar', message: 'Monitoring closely',
    value: 620, threshold: 500, unit: 'ppm',
    timestamp: '08:50 AM', timestampFull: '02 Sep 2026, 08:50 AM',
    resolved: false,
  },
  {
    id: 'ALT-010', level: 'warning', stationId: 'WS-018', stationName: 'Gamharia', district: 'Saraikela',
    parameter: 'pH', title: 'Low pH detected — Gamharia', message: 'Under caution',
    value: 6.6, threshold: 6.5, unit: 'pH',
    timestamp: '08:20 AM', timestampFull: '02 Sep 2026, 08:20 AM',
    resolved: false,
  },
  // Historical alerts
  {
    id: 'ALT-011', level: 'resolved', stationId: 'WS-004', stationName: 'Katras', district: 'Dhanbad',
    parameter: 'Turbidity', title: 'Turbidity above limit (6.2 NTU) — auto corrected', message: 'Treatment system adjusted',
    value: 6.2, threshold: 5.0, unit: 'NTU',
    timestamp: '09:42 AM', timestampFull: '28 Aug 2026, 09:42 AM',
    resolved: true, actionTaken: 'Auto-correction via sediment filter backwash',
  },
  {
    id: 'ALT-012', level: 'info', stationId: 'WS-001', stationName: 'Jharia', district: 'Dhanbad',
    parameter: 'Maintenance', title: 'Scheduled maintenance completed', message: 'UV bulb replaced',
    timestamp: '06:15 PM', timestampFull: '25 Aug 2026, 06:15 PM',
    resolved: true,
  },
  {
    id: 'ALT-013', level: 'critical', stationId: 'WS-004', stationName: 'Katras', district: 'Dhanbad',
    parameter: 'TDS', title: 'High TDS detected (820 ppm) — supply blocked', message: 'Supply was blocked for 4 hours',
    value: 820, threshold: 500, unit: 'ppm',
    timestamp: '11:20 AM', timestampFull: '21 Aug 2026, 11:20 AM',
    resolved: true, actionTaken: 'Manual filter replacement',
  },
  {
    id: 'ALT-014', level: 'info', stationId: 'WS-001', stationName: 'Jharia', district: 'Dhanbad',
    parameter: 'System', title: 'System back online', message: 'Post-maintenance restart',
    timestamp: '08:05 AM', timestampFull: '18 Aug 2026, 08:05 AM',
    resolved: true,
  },
  {
    id: 'ALT-015', level: 'resolved', stationId: 'WS-005', stationName: 'Nirsa', district: 'Dhanbad',
    parameter: 'Flow', title: 'Flow rate normalized — Nirsa', message: 'Flow restored to normal',
    timestamp: '07:30 AM', timestampFull: '02 Sep 2026, 07:30 AM',
    resolved: true,
  },
  {
    id: 'ALT-016', level: 'info', stationId: 'WS-012', stationName: 'Chas', district: 'Bokaro',
    parameter: 'System', title: 'Sensor calibration completed — Chas', message: 'All sensors recalibrated',
    timestamp: '06:30 AM', timestampFull: '01 Sep 2026, 06:30 AM',
    resolved: true,
  },
  {
    id: 'ALT-017', level: 'warning', stationId: 'WS-003', stationName: 'Baghmara', district: 'Dhanbad',
    parameter: 'Chlorine', title: 'Low residual chlorine — Baghmara', message: 'Below minimum threshold',
    value: 0.1, threshold: 0.2, unit: 'mg/L',
    timestamp: '09:50 AM', timestampFull: '02 Sep 2026, 09:50 AM',
    resolved: false,
  },
  {
    id: 'ALT-018', level: 'info', stationId: 'WS-007', stationName: 'Topchanchi', district: 'Dhanbad',
    parameter: 'Connectivity', title: 'Intermittent connectivity — Topchanchi', message: 'Signal strength fluctuating',
    timestamp: '09:30 AM', timestampFull: '02 Sep 2026, 09:30 AM',
    resolved: false,
  },
]

export function getAlertCounts(alertList: Alert[]) {
  const todayAlerts = alertList
  return {
    critical: todayAlerts.filter(a => a.level === 'critical' && !a.resolved).length,
    warnings: todayAlerts.filter(a => a.level === 'warning' && !a.resolved).length,
    info: todayAlerts.filter(a => a.level === 'info').length,
    resolved: todayAlerts.filter(a => a.resolved).length,
  }
}
