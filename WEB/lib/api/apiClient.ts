import type { WaterStation, Alert, StationStatus, QualityStatus, Connectivity } from '@/lib/types';
import { stations as fallbackStations } from '@/lib/data/stations';
import { alerts as fallbackAlerts } from '@/lib/data/alerts';
import { getAccessToken, clearSession } from '@/lib/auth/session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hydrapure.onrender.com/api/v1';

/** Build headers with optional Authorization token */
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** If a response is 401, clear local session so middleware redirects to login */
function handle401(res: Response): void {
  if (res.status === 401) {
    clearSession();
  }
}

// Format helper for relative/readable time
function formatTimestamp(isoString?: string): string {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

// Map backend station model to frontend WaterStation model
export function mapBackendStationToFrontend(s: any, index: number): WaterStation {
  const fallback = fallbackStations[index % fallbackStations.length] || fallbackStations[0];
  
  const status: StationStatus = 
    s.status === 'BLOCKED' ? 'BLOCKED' :
    s.status === 'CAUTION' ? 'CAUTION' : 'SAFE';

  const qualityStatus: QualityStatus =
    status === 'SAFE' ? 'Good' :
    status === 'CAUTION' ? 'Caution' : 'Poor';

  const connectivity: Connectivity =
    s.connectivity_status === 'OFFLINE' ? 'Offline' :
    s.connectivity_status === 'INTERMITTENT' ? 'Intermittent' : 'Online';

  return {
    id: s.id || fallback.id,
    stationId: s.station_code || s.code || `WS-00${index + 1}`,
    name: s.name || fallback.name,
    district: s.district || fallback.district,
    state: 'Jharkhand',
    status,
    qualityStatus,
    connectivity,
    // Real or synthetic sensor readings consistent with status
    ph: s.latest_telemetry?.ph ?? (status === 'SAFE' ? +(7.1 + (index % 4) * 0.1).toFixed(2) : status === 'CAUTION' ? 6.42 : 5.85),
    tds: s.latest_telemetry?.tds ?? (status === 'SAFE' ? 220 + index * 15 : status === 'CAUTION' ? 440 : 1500),
    turbidity: s.latest_telemetry?.turbidity ?? (status === 'SAFE' ? +(0.6 + (index % 3) * 0.2).toFixed(2) : status === 'CAUTION' ? 2.4 : 6.8),
    temperature: s.latest_telemetry?.temperature ?? +(24.5 + (index % 3) * 0.5).toFixed(1),
    flow: s.latest_telemetry?.flow_rate ?? (status === 'BLOCKED' ? 0.0 : +(26.0 + (index % 6) * 1.5).toFixed(1)),
    chlorine: s.latest_telemetry?.chlorine ?? (status === 'SAFE' ? +(0.8 + (index % 3) * 0.1).toFixed(2) : 0.2),
    lastUpdate: formatTimestamp(s.last_seen_at || s.updated_at),
    lastUpdateFull: s.last_seen_at || new Date().toISOString(),
    operator: fallback.operator || 'Jal Sahiya Operator',
    operatorPhone: fallback.operatorPhone || '+91 94310 99999',
    latitude: s.latitude || fallback.latitude,
    longitude: s.longitude || fallback.longitude,
    nearbyAreas: fallback.nearbyAreas || ['Local Hamlet', 'Primary School'],
    mapX: fallback.mapX || 50,
    mapY: fallback.mapY || 50,
    treatmentStages: fallback.treatmentStages || [
      { name: 'Dual Media Filter', status: 'Running', label: 'DMF' },
      { name: 'Activated Carbon', status: 'Running', label: 'ACF' },
      { name: 'RO Membrane', status: 'Running', label: 'RO' },
      { name: 'UV Disinfection', status: 'Running', label: 'UV' },
    ],
    supplyActive: status !== 'BLOCKED',
    supplyFlowRate: status === 'BLOCKED' ? 0 : +(26.5 + (index % 4) * 1.2).toFixed(1),
    householdsCovered: s.households_covered || fallback.householdsCovered || 300,
    supplySince: fallback.supplySince || '06:00 AM Today',
  };
}

// Map backend alert to frontend Alert
export function mapBackendAlertToFrontend(a: any, index: number): Alert {
  const fallback = fallbackAlerts[index % fallbackAlerts.length] || fallbackAlerts[0];

  const level = 
    a.status === 'RESOLVED' ? 'resolved' :
    a.severity === 'CRITICAL' ? 'critical' :
    a.severity === 'WARNING' ? 'warning' : 'info';

  return {
    id: a.id || `alt-${index}`,
    level,
    stationId: a.station_id || fallback.stationId,
    stationName: a.station_name || fallback.stationName || 'Station',
    district: a.district || fallback.district || 'Dhanbad',
    parameter: a.metric_name || a.parameter || fallback.parameter || 'Water Quality',
    title: a.title || (a.metric_name ? `Abnormal ${a.metric_name}` : a.message?.slice(0, 40) || 'Quality Alert'),
    message: a.message || fallback.message,
    value: a.value,
    threshold: a.threshold,
    unit: a.unit,
    timestamp: formatTimestamp(a.created_at),
    timestampFull: a.created_at || new Date().toISOString(),
    resolved: a.status === 'RESOLVED',
    actionTaken: a.resolution_notes,
    notifiedTo: a.notified_to || 'Jal Sahiya & Block Engineer',
  };
}

// API Functions with automatic fallback
export async function getStationsApi(): Promise<{ stations: WaterStation[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/stations?limit=50`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(4000),
    });
    handle401(res);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const body = await res.json();
    const data = body.data || [];
    if (Array.isArray(data) && data.length > 0) {
      return {
        stations: data.map((s: any, idx: number) => mapBackendStationToFrontend(s, idx)),
        isLive: true,
      };
    }
  } catch (err) {
    console.warn('[ApiClient] Failed to fetch stations from backend, using robust fallback data:', err);
  }
  return { stations: fallbackStations, isLive: false };
}

export async function getAlertsApi(): Promise<{ alerts: Alert[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts?limit=50`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(4000),
    });
    handle401(res);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const body = await res.json();
    const data = body.data || [];
    if (Array.isArray(data) && data.length > 0) {
      return {
        alerts: data.map((a: any, idx: number) => mapBackendAlertToFrontend(a, idx)),
        isLive: true,
      };
    }
  } catch (err) {
    console.warn('[ApiClient] Failed to fetch alerts from backend, using fallback data:', err);
  }
  return { alerts: fallbackAlerts, isLive: false };
}

export async function getDashboardSummaryApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const body = await res.json();
    return body.data;
  } catch (err) {
    console.warn('[ApiClient] Failed to fetch summary from backend:', err);
    return null;
  }
}

export async function resolveAlertApi(alertId: string, resolutionNotes: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resolution_notes: resolutionNotes }),
      signal: AbortSignal.timeout(4000),
    });
    handle401(res);
    return res.ok;
  } catch (err) {
    console.error('[ApiClient] Error resolving alert:', err);
    return false;
  }
}
