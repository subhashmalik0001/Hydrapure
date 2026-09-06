'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Radio,
  ShieldCheck,
  CircleAlert,
  XCircle,
  Eye,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  Droplets,
  Search,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { districts } from '@/lib/data/districts'
import type { WaterStation } from '@/lib/types'
import StatusPill from '@/components/status/StatusPill'
import DataTable, { type Column } from '@/components/tables/DataTable'
import KpiCard from '@/components/cards/KpiCard'

export default function StationsPage() {
  const { stations, searchQuery } = useApp()

  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedConnectivity, setSelectedConnectivity] = useState<string>('All')
  const [localSearch, setLocalSearch] = useState('')

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (selectedDistrict !== 'All Districts' && s.district !== selectedDistrict) return false
      if (selectedStatus !== 'All' && s.status !== selectedStatus.toUpperCase()) return false
      if (selectedConnectivity !== 'All' && s.connectivity !== selectedConnectivity) return false

      const query = (searchQuery || localSearch).toLowerCase().trim()
      if (query) {
        const matches =
          s.name.toLowerCase().includes(query) ||
          s.stationId.toLowerCase().includes(query) ||
          s.district.toLowerCase().includes(query) ||
          s.operator.toLowerCase().includes(query)
        if (!matches) return false
      }
      return true
    })
  }, [stations, selectedDistrict, selectedStatus, selectedConnectivity, searchQuery, localSearch])

  // Summary counts
  const totalCount = stations.length
  const safeCount = stations.filter(s => s.status === 'SAFE').length
  const cautionCount = stations.filter(s => s.status === 'CAUTION').length
  const blockedCount = stations.filter(s => s.status === 'BLOCKED').length
  const onlineCount = stations.filter(s => s.connectivity === 'Online').length

  const columns: Column<WaterStation>[] = [
    {
      key: 'stationId',
      header: 'Station ID',
      width: '100px',
      sortable: true,
      render: s => <span className="muted-cell" style={{ fontWeight: 600 }}>{s.stationId}</span>,
    },
    {
      key: 'name',
      header: 'Station Name',
      sortable: true,
      render: s => (
        <Link href={`/stations/${s.id}`} style={{ textDecoration: 'none', color: '#101820' }}>
          <strong>{s.name}</strong>
          <span style={{ display: 'block', fontSize: '10px', color: '#8b969e' }}>
            Operated by {s.operator}
          </span>
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
      header: 'Water Status',
      sortable: true,
      render: s => <StatusPill status={s.status} />,
    },
    {
      key: 'connectivity',
      header: 'Telemetry',
      render: s => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px', color: s.connectivity === 'Online' ? '#18845b' : '#c48216' }}>
          {s.connectivity === 'Online' ? <Wifi size={13} /> : <WifiOff size={13} />}
          {s.connectivity}
        </span>
      ),
    },
    {
      key: 'ph',
      header: 'pH',
      sortable: true,
      render: s => (
        <span className="params" style={{ color: s.ph < 6.5 || s.ph > 8.5 ? '#d45252' : '#202a31' }}>
          {s.ph.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'tds',
      header: 'TDS (ppm)',
      sortable: true,
      render: s => (
        <span className="params" style={{ color: s.tds > 500 ? '#d45252' : '#202a31', fontWeight: s.tds > 500 ? 700 : 400 }}>
          {s.tds}
        </span>
      ),
    },
    {
      key: 'turbidity',
      header: 'Turbidity (NTU)',
      sortable: true,
      render: s => (
        <span className="params" style={{ color: s.turbidity > 5.0 ? '#d45252' : '#202a31' }}>
          {s.turbidity}
        </span>
      ),
    },
    {
      key: 'flow',
      header: 'Flow (L/s)',
      sortable: true,
      render: s => <span>{s.flow > 0 ? `${s.flow} L/s` : <span style={{ color: '#d45252', fontWeight: 600 }}>0 (Halted)</span>}</span>,
    },
    {
      key: 'lastUpdate',
      header: 'Last Sync',
      render: s => <span className="muted-cell">{s.lastUpdate}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: s => (
        <Link href={`/stations/${s.id}`} className="view-text">
          <Eye size={12} />
          <span>Details</span>
        </Link>
      ),
    },
  ]

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FACILITY DIRECTORY & SENSOR NODES</div>
          <h1>Water Stations</h1>
          <p>Real-time purification telemetry, valve automations, and parameter status.</p>
        </div>
        <div className="heading-actions">
          <span className="online">
            <i /> {onlineCount} of {totalCount} Online
          </span>
          <Link href="/map" className="export-button" style={{ textDecoration: 'none' }}>
            <MapPin size={14} />
            <span>Map View</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <section className="kpi-grid">
        <KpiCard
          label="TOTAL NODES"
          value={totalCount}
          subtitle="All blocks"
          description="Deployed IoT filtration units"
          icon={Radio}
          tone="up"
        />
        <KpiCard
          label="SAFE SUPPLY"
          value={safeCount}
          subtitle={`${Math.round((safeCount / totalCount) * 100)}%`}
          description="Active community clean distribution"
          icon={ShieldCheck}
          tone="safe"
        />
        <KpiCard
          label="UNDER CAUTION"
          value={cautionCount}
          subtitle={`${Math.round((cautionCount / totalCount) * 100)}%`}
          description="Treatment adjustment underway"
          icon={CircleAlert}
          tone="caution"
        />
        <KpiCard
          label="SUPPLY BLOCKED"
          value={blockedCount}
          subtitle={`${Math.round((blockedCount / totalCount) * 100)}%`}
          description="Automatic shutoff valve engaged"
          icon={XCircle}
          tone="blocked"
        />
      </section>

      {/* Main Table Card */}
      <section className="card table-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Water Purification Stations</h2>
            <p>Showing {filteredStations.length} matching stations</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Filter District */}
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              aria-label="Filter district"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Filter Status */}
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

            {/* Filter Connectivity */}
            <select
              value={selectedConnectivity}
              onChange={e => setSelectedConnectivity(e.target.value)}
              aria-label="Filter connectivity"
            >
              <option value="All">All Telemetry</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>

            {/* Local Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Filter by name..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  fontSize: '11px',
                  color: '#101820',
                  outline: 'none',
                  width: '150px',
                }}
              />
            </div>
          </div>
        </div>

        <DataTable
          data={filteredStations}
          columns={columns}
          pageSize={10}
          emptyMessage="No stations match the selected criteria"
        />
      </section>
    </>
  )
}
