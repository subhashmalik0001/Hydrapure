'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Radio,
  ShieldCheck,
  CircleAlert,
  XCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2,
  Droplets,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { districts } from '@/lib/data/districts'
import type { WaterStation, Alert } from '@/lib/types'
import KpiCard from '@/components/cards/KpiCard'
import StatusPill from '@/components/status/StatusPill'
import StationMap from '@/components/map/StationMap'
import WaterQualityChart from '@/components/charts/WaterQualityChart'
import AlertDetailModal from '@/components/modals/AlertDetailModal'
import DataTable, { type Column } from '@/components/tables/DataTable'

export default function DashboardPage() {
  const { stations, alerts, lastSync, syncData, isSyncing, searchQuery, resolveAlert } = useApp()

  const [district, setDistrict] = useState<string>('All Districts')
  const [stationTab, setStationTab] = useState<'All' | 'Safe' | 'Caution' | 'Blocked'>('All')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  // Filter stations based on tabs, district, and search query
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchDistrict = district === 'All Districts' || s.district === district
      const matchTab =
        stationTab === 'All' ||
        (stationTab === 'Safe' && s.status === 'SAFE') ||
        (stationTab === 'Caution' && s.status === 'CAUTION') ||
        (stationTab === 'Blocked' && s.status === 'BLOCKED')
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.stationId.toLowerCase().includes(q) ||
        s.operator.toLowerCase().includes(q)
      return matchDistrict && matchTab && matchQuery
    })
  }, [stations, district, stationTab, searchQuery])

  // KPI stats
  const safeCount = stations.filter(s => s.status === 'SAFE').length
  const cautionCount = stations.filter(s => s.status === 'CAUTION').length
  const blockedCount = stations.filter(s => s.status === 'BLOCKED').length

  // Table columns definition
  const columns: Column<WaterStation>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '60px',
      render: s => <span className="muted-cell">{s.stationId}</span>,
    },
    {
      key: 'name',
      header: 'STATION',
      sortable: true,
      render: s => (
        <Link href={`/stations/${s.id}`} style={{ textDecoration: 'none' }}>
          <strong style={{ color: '#101820', cursor: 'pointer' }}>{s.name}</strong>
        </Link>
      ),
    },
    {
      key: 'district',
      header: 'DISTRICT',
      sortable: true,
      render: s => <span>{s.district}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      render: s => <StatusPill status={s.status} />,
    },
    {
      key: 'ph',
      header: 'PH',
      sortable: true,
      render: s => <span className="params">{s.ph.toFixed(2)}</span>,
    },
    {
      key: 'tds',
      header: 'TDS (PPM)',
      sortable: true,
      render: s => <span className="params">{s.tds}</span>,
    },
    {
      key: 'turbidity',
      header: 'TURBIDITY (NTU)',
      sortable: true,
      render: s => <span className="params">{s.turbidity}</span>,
    },
    {
      key: 'temperature',
      header: 'TEMP (°C)',
      sortable: true,
      render: s => <span className="params">{s.temperature}°</span>,
    },
    {
      key: 'flow',
      header: 'OUTFLOW',
      sortable: true,
      render: s => <span className="params">{s.flow} L/s</span>,
    },
    {
      key: 'lastUpdate',
      header: 'LAST UPDATE',
      render: s => <span className="muted-cell">{s.lastUpdate}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: s => (
        <Link href={`/stations/${s.id}`} className="view-text">
          <Eye size={12} />
          <span>View</span>
        </Link>
      ),
    },
  ]

  return (
    <>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">RURAL WATER SAFETY, REAL IMPACT</div>
          <h1>Welcome back</h1>
          <p>Monitor. Treat. Verify. Supply. Alert. Learn.</p>
          <span className="date-line">
            Tuesday, 2 September 2026&nbsp;&nbsp; {lastSync}
          </span>
        </div>
        <div className="heading-actions">
          <span className="online">
            <i /> System Online
          </span>
          <button className="export-button" onClick={syncData} disabled={isSyncing}>
            <RefreshCw className={isSyncing ? 'spinning' : ''} size={14} />
            {isSyncing ? 'Syncing...' : 'Sync data'}
          </button>
          <button className="round-button" aria-label="More actions">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        <KpiCard
          label="TOTAL STATIONS"
          value={stations.length}
          subtitle="+2 this month"
          description="Active monitoring stations across Jharkhand"
          icon={Radio}
          tone="up"
        />
        <KpiCard
          label="SAFE SUPPLY"
          value={safeCount}
          subtitle={`${Math.round((safeCount / (stations.length || 1)) * 100)}% of total`}
          description="Water verified and ready for supply"
          icon={ShieldCheck}
          tone="safe"
        />
        <KpiCard
          label="UNDER CAUTION"
          value={cautionCount}
          subtitle={`${Math.round((cautionCount / (stations.length || 1)) * 100)}% of total`}
          description="Treatment or operator review needed"
          icon={CircleAlert}
          tone="caution"
        />
        <KpiCard
          label="SUPPLY BLOCKED"
          value={blockedCount}
          subtitle={`${Math.round((blockedCount / (stations.length || 1)) * 100)}% of total`}
          description="Automatic block-divert engaged"
          icon={XCircle}
          tone="blocked"
        />
      </section>

      {/* Dashboard Main Grid: Stations Map (Left) + Alerts (Right) */}
      <div className="dashboard-grid">
        {/* Left: Stations Map Card */}
        <section className="card stations-card">
          <div className="card-header">
            <div>
              <h2>Water Stations Across Jharkhand</h2>
              <p>Live status of all stations ({filteredStations.length} shown)</p>
            </div>
            <div className="header-controls">
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                aria-label="Filter district"
              >
                {districts.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button className="icon-button" aria-label="More station options">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="station-tabs">
            {(['All', 'Safe', 'Caution', 'Blocked'] as const).map(tab => (
              <button
                key={tab}
                className={stationTab === tab ? 'selected' : ''}
                onClick={() => setStationTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <StationMap
            stations={stations}
            filter={stationTab}
            district={district}
            searchQuery={searchQuery}
            height={240}
          />

          <div className="station-foot">
            <span>
              <Radio /> Multi-District IoT Mesh
            </span>
            <span>
              <Droplets /> Automated Solenoid Shutoff
            </span>
            <Link
              href="/map"
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#155e75',
                fontSize: '11px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Full Map</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </section>

        {/* Right: Live Alerts Card */}
        <section className="card alerts-card">
          <div className="card-header">
            <div>
              <h2>Live Alerts</h2>
              <p>Critical incidents & auto actions</p>
            </div>
            <Link href="/alerts" className="view-link">
              <span>View all ({alerts.filter(a => !a.resolved).length})</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="alerts-list">
            {alerts.slice(0, 4).map(alert => {
              const tone = alert.level === 'critical' ? 'blocked' : alert.level === 'warning' ? 'caution' : 'safe'
              const Icon = alert.level === 'critical' ? XCircle : alert.level === 'warning' ? CircleAlert : CheckCircle2

              return (
                <div
                  key={alert.id}
                  className="alert-row"
                  onClick={() => setSelectedAlert(alert)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`alert-icon ${tone}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <strong>{alert.title}</strong>
                    <span>{alert.message}</span>
                  </div>
                  <time>{alert.timestamp}</time>
                </div>
              )
            })}
          </div>

          <div className="logic-strip">
            <span>
              <XCircle size={12} /> High TDS (&gt;500 ppm)
            </span>
            <b>→</b>
            <span>
              <Droplets size={12} /> Supply blocked
            </span>
            <b>→</b>
            <span>
              <Info size={12} /> SMS dispatched
            </span>
          </div>
        </section>

        {/* Full-width: Water Quality Trends Recharts */}
        <section className="card trends-card">
          <div className="card-header">
            <div>
              <h2>Water Quality Trends & Analysis</h2>
              <p>Real-time parameter fluctuation & compliance boundaries</p>
            </div>
            <Link
              href="/quality"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#155e75',
                fontSize: '11px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Detailed Analytics</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <WaterQualityChart defaultParameter="tds" />

          <div className="sensor-footer">
            <span>
              Sensor: <b>Optical Nephelometric + Galvanic Probe</b>
            </span>
            <span>
              Sample Rate: <b>Every 30s</b>
            </span>
            <span>
              Calibration: <b>Certified 28 Aug 2026</b>
            </span>
          </div>
        </section>

        {/* Full-width: Water Station Monitoring Table */}
        <section className="card table-card">
          <div className="card-header">
            <div>
              <h2>Water Station Monitoring</h2>
              <p>
                Showing {filteredStations.length} of {stations.length} total stations
              </p>
            </div>
            <div className="header-controls">
              <Link href="/stations" className="export-button" style={{ textDecoration: 'none' }}>
                <SlidersHorizontal size={13} />
                <span>All Stations</span>
              </Link>
            </div>
          </div>

          <DataTable
            data={filteredStations}
            columns={columns}
            pageSize={8}
            emptyMessage="No stations match your current filters"
          />
        </section>
      </div>

      {/* Alert Inspection Dialog */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={resolveAlert}
      />
    </>
  )
}
