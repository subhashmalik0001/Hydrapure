'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Wifi,
  WifiOff,
  User,
  Phone,
  Droplets,
  Activity,
  Thermometer,
  ShieldCheck,
  CircleAlert,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import StatusPill from '@/components/status/StatusPill'
import MetricCard from '@/components/cards/MetricCard'
import TreatmentPipeline from '@/components/charts/TreatmentPipeline'
import SupplyStatusCard from '@/components/cards/SupplyStatusCard'
import WaterQualityChart from '@/components/charts/WaterQualityChart'
import AlertDetailModal from '@/components/modals/AlertDetailModal'
import type { Alert } from '@/lib/types'

export default function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { stations, alerts, resolveAlert } = useApp()

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const station = stations.find(s => s.id === id || s.stationId === id)

  if (!station) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Station Not Found</h2>
        <p style={{ color: '#64748b', margin: '12px 0 24px' }}>
          The requested water station could not be found.
        </p>
        <Link href="/stations" className="export-button" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          <ArrowLeft size={14} />
          <span>Back to Stations</span>
        </Link>
      </div>
    )
  }

  // Alerts for this station
  const stationAlerts = alerts.filter(a => a.stationId === station.stationId || a.stationName === station.name)

  const getPhStatus = (ph: number) => {
    if (ph >= 6.5 && ph <= 8.5) return { status: 'Optimal (BIS 10500)', tone: 'safe' as const }
    if (ph >= 6.0 && ph <= 9.0) return { status: 'Caution (Slight Shift)', tone: 'caution' as const }
    return { status: 'Hazardous (Acidic/Alkaline)', tone: 'blocked' as const }
  }

  const getTdsStatus = (tds: number) => {
    if (tds <= 300) return { status: 'Excellent Drinking', tone: 'safe' as const }
    if (tds <= 500) return { status: 'Acceptable Limit', tone: 'safe' as const }
    if (tds <= 1000) return { status: 'Caution (Elevated)', tone: 'caution' as const }
    return { status: 'Blocked (Over Limit)', tone: 'blocked' as const }
  }

  const getTurbStatus = (turb: number) => {
    if (turb <= 1.0) return { status: 'Clear & Safe', tone: 'safe' as const }
    if (turb <= 5.0) return { status: 'Acceptable', tone: 'safe' as const }
    return { status: 'High Turbidity', tone: 'blocked' as const }
  }

  const phMeta = getPhStatus(station.ph)
  const tdsMeta = getTdsStatus(station.tds)
  const turbMeta = getTurbStatus(station.turbidity)

  return (
    <>
      {/* Back Link & Navigation Breadcrumb */}
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/stations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748b',
            fontSize: '12px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to All Water Stations</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: 20, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="muted-cell" style={{ fontWeight: 700, letterSpacing: '0.05em', color: '#155e75' }}>
                {station.stationId}
              </span>
              <StatusPill status={station.status} size="lg" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px', color: station.connectivity === 'Online' ? '#18845b' : '#c48216' }}>
                {station.connectivity === 'Online' ? <Wifi size={13} /> : <WifiOff size={13} />}
                {station.connectivity} Telemetry
              </span>
            </div>
            <h1 style={{ fontSize: '28px', margin: '4px 0 6px' }}>{station.name} Filtration Station</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              {station.district} District, {station.state} • Coordinates: {station.latitude}° N, {station.longitude}° E
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Last telemetry sync: {station.lastUpdateFull || station.lastUpdate}
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Link href="/map" className="export-button" style={{ textDecoration: 'none', fontSize: '11px', padding: '8px 14px' }}>
                <MapPin size={13} />
                <span>Locate on Map</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <MetricCard
          icon={Activity}
          label="Water pH"
          value={station.ph.toFixed(2)}
          range="Permissible: 6.5 – 8.5"
          status={phMeta.status}
          statusTone={phMeta.tone}
        />
        <MetricCard
          icon={Droplets}
          label="Total Dissolved Solids"
          value={station.tds}
          unit="ppm"
          range="Safe Limit: < 500 ppm"
          status={tdsMeta.status}
          statusTone={tdsMeta.tone}
        />
        <MetricCard
          icon={Sparkles}
          label="Turbidity"
          value={station.turbidity}
          unit="NTU"
          range="Safe Limit: < 5.0 NTU"
          status={turbMeta.status}
          statusTone={turbMeta.tone}
        />
        <MetricCard
          icon={Thermometer}
          label="Water Temperature"
          value={station.temperature}
          unit="°C"
          range="Normal: 20 – 30 °C"
          status="Normal Range"
          statusTone="safe"
        />
        <MetricCard
          icon={Activity}
          label="Supply Flow Rate"
          value={station.flow}
          unit="L/s"
          range="Design Flow: 15 – 25 L/s"
          status={station.flow > 0 ? 'Active Stream' : 'Valve Closed'}
          statusTone={station.flow > 0 ? 'safe' : 'blocked'}
        />
      </section>

      {/* Two Columns: Pipeline + Supply (Left) and Operator + Location (Right) */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        {/* Left: Treatment Stages & Supply Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Multi-Stage Treatment Pipeline</h2>
                <p>Real-time operating status of each inline purification module</p>
              </div>
            </div>
            <TreatmentPipeline stages={station.treatmentStages} />
          </div>

          <SupplyStatusCard
            active={station.supplyActive}
            flowRate={station.supplyFlowRate}
            households={station.householdsCovered}
            since={station.supplySince}
            stationName={station.name}
          />
        </div>

        {/* Right: Operator, Coverage & Station Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Station Operator Info Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Station Caretaker</h2>
                <p>Assigned Jal Sahiya / Local Operator</p>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  <User size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{station.operator}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                    <Phone size={11} />
                    <span>{station.operatorPhone}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #edf1f3', paddingTop: 12 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#8b969e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Settlements & Tolas Served
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {station.nearbyAreas.map(area => (
                    <span
                      key={area}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Station Alert Log */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Station Alerts History</h2>
                <p>{stationAlerts.length} recorded incidents</p>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              {stationAlerts.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#8b969e', fontSize: '12px' }}>
                  No active or past alerts for this station. System running normally.
                </div>
              ) : (
                stationAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="alert-row"
                    onClick={() => setSelectedAlert(alert)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`alert-icon ${alert.level === 'critical' ? 'blocked' : alert.level === 'warning' ? 'caution' : 'safe'}`}>
                      {alert.level === 'critical' ? <XCircle size={15} /> : alert.level === 'warning' ? <CircleAlert size={15} /> : <ShieldCheck size={15} />}
                    </div>
                    <div>
                      <strong>{alert.title}</strong>
                      <span>{alert.message}</span>
                    </div>
                    <time>{alert.timestamp}</time>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2>Water Quality Trends for {station.name}</h2>
            <p>24-hour continuous sensor feed data</p>
          </div>
        </div>
        <WaterQualityChart defaultParameter="tds" />
      </div>

      {/* Alert Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={resolveAlert}
      />
    </>
  )
}
