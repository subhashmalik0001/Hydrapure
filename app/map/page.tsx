'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Radio,
  ShieldCheck,
  CircleAlert,
  XCircle,
  ExternalLink,
  Activity,
  Droplets,
  Phone,
  User,
  Search,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { districts } from '@/lib/data/districts'
import type { WaterStation } from '@/lib/types'
import StatusPill from '@/components/status/StatusPill'
import StationMap from '@/components/map/StationMap'

export default function MapPage() {
  const { stations, searchQuery } = useApp()

  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Safe' | 'Caution' | 'Blocked'>('All')
  const [selectedStation, setSelectedStation] = useState<WaterStation>(stations[0])

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (selectedDistrict !== 'All Districts' && s.district !== selectedDistrict) return false
      if (statusFilter !== 'All' && s.status !== statusFilter.toUpperCase()) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.stationId.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [stations, selectedDistrict, statusFilter, searchQuery])

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">GEOSPATIAL SENSOR NETWORK</div>
          <h1>Jharkhand Station Mesh</h1>
          <p>Live telemetry and valve status for all monitored purification units across the state.</p>
        </div>
        <div className="heading-actions">
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            aria-label="Filter district"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Viewport & Station Quick Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: 16, marginBottom: 20 }}>
        {/* Left: Map Container */}
        <section className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <h2>Regional Mesh Visualization</h2>
              <p>Click any station marker on the map to inspect live feed</p>
            </div>
            <div className="station-tabs" style={{ marginTop: 0 }}>
              {(['All', 'Safe', 'Caution', 'Blocked'] as const).map(tab => (
                <button
                  key={tab}
                  className={statusFilter === tab ? 'selected' : ''}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '440px' }}>
            <StationMap
              stations={stations}
              filter={statusFilter}
              district={selectedDistrict}
              searchQuery={searchQuery}
              height={440}
              selectedStationId={selectedStation?.id}
              onSelectStation={s => setSelectedStation(s)}
            />
          </div>
        </section>

        {/* Right: Selected Station Telemetry Card */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedStation ? (
            <div>
              <div className="card-header" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#155e75' }}>
                      {selectedStation.stationId}
                    </span>
                    <StatusPill status={selectedStation.status} size="sm" />
                  </div>
                  <h2>{selectedStation.name} Station</h2>
                  <p>{selectedStation.district} District • {selectedStation.state}</p>
                </div>
              </div>

              {/* Parameter Readouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '16px 0' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>pH Value</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {selectedStation.ph.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>Range: 6.5 – 8.5</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>TDS Level</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: selectedStation.tds > 500 ? '#d45252' : '#0f172a', marginTop: 2 }}>
                    {selectedStation.tds} <span style={{ fontSize: '11px', fontWeight: 500 }}>ppm</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>Limit: &lt; 500 ppm</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Turbidity</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: selectedStation.turbidity > 5 ? '#d45252' : '#0f172a', marginTop: 2 }}>
                    {selectedStation.turbidity} <span style={{ fontSize: '11px', fontWeight: 500 }}>NTU</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>Limit: &lt; 5.0 NTU</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Water Outflow</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: selectedStation.flow === 0 ? '#d45252' : '#0f172a', marginTop: 2 }}>
                    {selectedStation.flow} <span style={{ fontSize: '11px', fontWeight: 500 }}>L/s</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>{selectedStation.flow === 0 ? 'Solenoid Locked' : 'Flowing'}</span>
                </div>
              </div>

              {/* Operator details */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} color="#155e75" />
                  <div>
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>{selectedStation.operator}</strong>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Operator • {selectedStation.operatorPhone}</span>
                  </div>
                </div>
              </div>

              {/* Settlements served */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#8b969e', textTransform: 'uppercase' }}>
                  Settlements Served
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {selectedStation.nearbyAreas.map(area => (
                    <span
                      key={area}
                      style={{ background: '#f1f5f9', color: '#334155', fontSize: '11px', padding: '3px 8px', borderRadius: '12px' }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/stations/${selectedStation.id}`}
                className="action-btn"
                style={{
                  background: '#101820',
                  color: 'white',
                  textDecoration: 'none',
                  marginTop: 'auto',
                }}
              >
                <ExternalLink size={14} />
                <span>Open Full Station Dashboard</span>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8b969e' }}>
              Select a station on the map to inspect
            </div>
          )}
        </section>
      </div>

      {/* Quick Select Stations Grid */}
      <section className="card">
        <div className="card-header">
          <div>
            <h2>All Network Nodes ({filteredStations.length})</h2>
            <p>Click any card to center on the map</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
          {filteredStations.map(s => {
            const isSelected = selectedStation?.id === s.id
            return (
              <div
                key={s.id}
                onClick={() => setSelectedStation(s)}
                style={{
                  background: isSelected ? '#f0f9ff' : '#f8fafc',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: '0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{s.name}</strong>
                  <StatusPill status={s.status} size="sm" />
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {s.district} • {s.stationId}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: '11px', color: '#334155' }}>
                  <span>pH <b>{s.ph.toFixed(1)}</b></span>
                  <span>TDS <b>{s.tds}</b></span>
                  <span>Turb <b>{s.turbidity}</b></span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
