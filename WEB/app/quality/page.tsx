'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  Droplets,
  Sparkles,
  Thermometer,
  ShieldCheck,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { districts } from '@/lib/data/districts'
import type { WaterStation } from '@/lib/types'
import StatusPill from '@/components/status/StatusPill'
import WaterQualityChart from '@/components/charts/WaterQualityChart'
import DataTable, { type Column } from '@/components/tables/DataTable'
import MetricCard from '@/components/cards/MetricCard'

export default function WaterQualityPage() {
  const { stations, searchQuery } = useApp()

  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (selectedDistrict !== 'All Districts' && s.district !== selectedDistrict) return false
      if (selectedStatus !== 'All' && s.status !== selectedStatus.toUpperCase()) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.stationId.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [stations, selectedDistrict, selectedStatus, searchQuery])

  // Average calculations
  const total = stations.length || 1
  const avgPh = +(stations.reduce((acc, s) => acc + s.ph, 0) / total).toFixed(2)
  const avgTds = Math.round(stations.reduce((acc, s) => acc + s.tds, 0) / total)
  const avgTurb = +(stations.reduce((acc, s) => acc + s.turbidity, 0) / total).toFixed(2)
  const safePercent = Math.round((stations.filter(s => s.status === 'SAFE').length / total) * 100)

  const handleExportCsv = () => {
    const headers = ['Station ID', 'Station Name', 'District', 'Status', 'pH', 'TDS (ppm)', 'Turbidity (NTU)', 'Temp (C)', 'Flow (L/s)', 'Last Update']
    const rows = filteredStations.map(s => [
      s.stationId,
      s.name,
      s.district,
      s.status,
      s.ph,
      s.tds,
      s.turbidity,
      s.temperature,
      s.flow,
      s.lastUpdate,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `hydrapure-water-quality-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: Column<WaterStation>[] = [
    {
      key: 'stationId',
      header: 'Station ID',
      width: '90px',
      render: s => <span className="muted-cell">{s.stationId}</span>,
    },
    {
      key: 'name',
      header: 'Station',
      sortable: true,
      render: s => (
        <Link href={`/stations/${s.id}`} style={{ textDecoration: 'none', color: '#101820' }}>
          <strong>{s.name}</strong>
        </Link>
      ),
    },
    {
      key: 'district',
      header: 'District',
      sortable: true,
      render: s => <span>{s.district}</span>,
    },
    {
      key: 'status',
      header: 'Overall Rating',
      sortable: true,
      render: s => <StatusPill status={s.status} />,
    },
    {
      key: 'ph',
      header: 'pH Reading',
      sortable: true,
      render: s => {
        const isNormal = s.ph >= 6.5 && s.ph <= 8.5
        return (
          <span style={{ color: isNormal ? '#101820' : '#d45252', fontWeight: isNormal ? 400 : 700 }}>
            {s.ph.toFixed(2)} {isNormal ? '' : '⚠️'}
          </span>
        )
      },
    },
    {
      key: 'tds',
      header: 'TDS (ppm)',
      sortable: true,
      render: s => {
        const isSafe = s.tds <= 500
        return (
          <span style={{ color: isSafe ? '#101820' : '#d45252', fontWeight: isSafe ? 400 : 700 }}>
            {s.tds} {isSafe ? '' : '⚠️'}
          </span>
        )
      },
    },
    {
      key: 'turbidity',
      header: 'Turbidity (NTU)',
      sortable: true,
      render: s => {
        const isClear = s.turbidity <= 5.0
        return (
          <span style={{ color: isClear ? '#101820' : '#d45252', fontWeight: isClear ? 400 : 700 }}>
            {s.turbidity} {isClear ? '' : '⚠️'}
          </span>
        )
      },
    },
    {
      key: 'chlorine',
      header: 'Free Chlorine',
      sortable: true,
      render: s => <span>{s.chlorine} mg/L</span>,
    },
    {
      key: 'compliance',
      header: 'BIS 10500 Standard',
      render: s => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', color: s.status === 'SAFE' ? '#18845b' : s.status === 'CAUTION' ? '#c48216' : '#d45252' }}>
          {s.status === 'SAFE' ? <CheckCircle2 size={13} /> : s.status === 'CAUTION' ? <AlertTriangle size={13} /> : <XCircle size={13} />}
          {s.status === 'SAFE' ? 'Compliant' : s.status === 'CAUTION' ? 'Tolerable' : 'Non-Compliant'}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">LAB-GRADE TELEMETRY & BIS STANDARDS</div>
          <h1>Water Quality</h1>
          <p>Continuous chemical and physical parameters monitored against Indian Standard IS 10500:2012.</p>
        </div>
        <div className="heading-actions">
          <button className="export-button" onClick={handleExportCsv}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 22 }}>
        <MetricCard
          icon={Activity}
          label="Average State pH"
          value={avgPh}
          range="BIS Standard: 6.5 – 8.5"
          status="Neutral & Safe"
          statusTone="safe"
        />
        <MetricCard
          icon={Droplets}
          label="Average TDS"
          value={avgTds}
          unit="ppm"
          range="Permissible: < 500 ppm"
          status={avgTds <= 500 ? 'Potable Zone' : 'Elevated'}
          statusTone={avgTds <= 500 ? 'safe' : 'caution'}
        />
        <MetricCard
          icon={Sparkles}
          label="Average Turbidity"
          value={avgTurb}
          unit="NTU"
          range="Safe Limit: < 5.0 NTU"
          status="Optically Clear"
          statusTone="safe"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Potability Index"
          value={`${safePercent}%`}
          range="Safety Compliance"
          status={`${stations.filter(s => s.status === 'SAFE').length} stations meeting IS 10500`}
          statusTone="safe"
        />
      </section>

      {/* Main Chart Section */}
      <section className="card trends-card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <div>
            <h2>Water Quality Time-Series Analysis</h2>
            <p>Select parameter and duration to view multi-point historical data</p>
          </div>
        </div>
        <WaterQualityChart defaultParameter="tds" showParameterTabs={true} showRangeSelector={true} />
        <div className="sensor-footer">
          <span>Standard: <b>IS 10500:2012 Drinking Water Specification</b></span>
          <span>Sampling Interval: <b>30 Seconds</b></span>
          <span>Validation: <b>Real-time sensor telemetry + monthly lab titration</b></span>
        </div>
      </section>

      {/* Station-by-Station Table */}
      <section className="card table-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Parameter Breakdown by Station</h2>
            <p>Live readouts for all {filteredStations.length} active stations</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              aria-label="Filter district"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              aria-label="Filter status"
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Caution">Caution</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredStations}
          columns={columns}
          pageSize={10}
          emptyMessage="No stations match the selected quality filters"
        />
      </section>
    </>
  )
}
