'use client'

import { useMemo, useState } from 'react'
import {
  Activity, Bell, ChevronDown, CircleHelp, Droplets, Gauge, LayoutDashboard,
  Map, MoreHorizontal, Search, Settings, ShieldCheck,
  Thermometer, Waves, ArrowUpRight, CheckCircle2, CircleAlert, XCircle, Zap, FlaskConical,
  FileText, MessageSquare, MapPin, Radio, RefreshCw, X, Eye
} from 'lucide-react'

export interface WaterStation {
  id: string
  name: string
  district: string
  status: 'SAFE' | 'CAUTION' | 'BLOCKED'
  ph: number
  tds: number
  turbidity: number
  temp: number
  flow: number
  update: string
  mapX: number
  mapY: number
  operator: string
}

const initialStations: WaterStation[] = [
  { id: '01', name: 'Jharia', district: 'Dhanbad', status: 'SAFE', ph: 7.2, tds: 310, turbidity: 1.2, temp: 24.8, flow: 18.4, update: '10:22 AM', mapX: 22, mapY: 42, operator: 'Rajesh Kumar' },
  { id: '02', name: 'Govindpur', district: 'Dhanbad', status: 'SAFE', ph: 7.5, tds: 290, turbidity: 0.8, temp: 25.1, flow: 19.0, update: '10:20 AM', mapX: 30, mapY: 57, operator: 'Sunita Sharma' },
  { id: '03', name: 'Baghmara', district: 'Dhanbad', status: 'BLOCKED', ph: 5.9, tds: 1500, turbidity: 12.4, temp: 26.4, flow: 0.0, update: '10:15 AM', mapX: 38, mapY: 31, operator: 'Amit Roy' },
  { id: '04', name: 'Katras', district: 'Dhanbad', status: 'CAUTION', ph: 6.8, tds: 820, turbidity: 4.5, temp: 25.8, flow: 12.2, update: '10:18 AM', mapX: 47, mapY: 48, operator: 'Priya Singh' },
  { id: '05', name: 'Nirsa', district: 'Dhanbad', status: 'SAFE', ph: 7.1, tds: 320, turbidity: 1.1, temp: 24.5, flow: 17.8, update: '10:19 AM', mapX: 55, mapY: 38, operator: 'Manoj Mahato' },
  { id: '06', name: 'Kanke', district: 'Ranchi', status: 'SAFE', ph: 7.4, tds: 210, turbidity: 0.6, temp: 23.2, flow: 21.5, update: '10:23 AM', mapX: 63, mapY: 55, operator: 'Anil Verma' },
  { id: '07', name: 'Ratu', district: 'Ranchi', status: 'CAUTION', ph: 6.6, tds: 680, turbidity: 3.8, temp: 24.1, flow: 14.1, update: '10:12 AM', mapX: 70, mapY: 29, operator: 'Ritu Minz' },
  { id: '08', name: 'Ghatshila', district: 'Jamshedpur', status: 'SAFE', ph: 7.3, tds: 275, turbidity: 0.9, temp: 26.0, flow: 20.4, update: '10:21 AM', mapX: 76, mapY: 46, operator: 'Suresh Hansda' },
  { id: '09', name: 'Chas', district: 'Bokaro', status: 'SAFE', ph: 7.0, tds: 340, turbidity: 1.4, temp: 25.0, flow: 16.5, update: '10:17 AM', mapX: 84, mapY: 35, operator: 'Vikram Soren' },
  { id: '10', name: 'Barhi', district: 'Hazaribagh', status: 'BLOCKED', ph: 5.4, tds: 1420, turbidity: 14.1, temp: 27.2, flow: 0.0, update: '10:05 AM', mapX: 42, mapY: 68, operator: 'Deepak Prasad' },
]

const navItems = [
  [LayoutDashboard, 'Dashboard'], [MapPin, 'Water Stations'], [Activity, 'Water Quality'],
  [Bell, 'Alerts'], [FileText, 'Reports'], [Map, 'Map'], [Settings, 'Settings'],
] as const

function StatusPill({ status }: { status: string }) {
  const tone = status === 'SAFE' ? 'safe' : status === 'CAUTION' ? 'caution' : 'blocked'
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{status}</span>
}

function CardMenu() { return <button className="icon-button" aria-label="More options"><MoreHorizontal /></button> }

function StationMap({ stations, filter, searchQuery, district }: { stations: WaterStation[]; filter: string; searchQuery: string; district: string }) {
  const filteredDots = useMemo(() => {
    return stations.filter(s => {
      const matchFilter = filter === 'All' || s.status === filter.toUpperCase()
      const matchDistrict = district === 'All Districts' || s.district === district
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) || s.status.toLowerCase().includes(q)
      return matchFilter && matchDistrict && matchSearch
    })
  }, [stations, filter, searchQuery, district])

  return (
    <div className="jharkhand-map" aria-label="Station status visualization across Jharkhand">
      <svg viewBox="0 0 100 90" role="img" aria-hidden="true">
        <path d="M15 18 35 8 59 13 78 8 91 24 86 40 93 57 79 70 64 80 42 77 27 84 12 65 16 48 8 34Z" />
      </svg>
      {filteredDots.map((s) => {
        const tone = s.status.toLowerCase()
        return (
          <span
            key={s.id}
            className={`map-dot ${tone}`}
            style={{ left: `${s.mapX}%`, top: `${s.mapY}%` }}
            title={`${s.name} (${s.district}) - ${s.status} | pH ${s.ph} | TDS ${s.tds}`}
          />
        )
      })}
      <div className="map-label label-north">NORTH KOEL</div>
      <div className="map-label label-east">DAMODAR BELT</div>
      <div className="map-label label-south">SOUTHERN ZONE</div>
      <div className="map-legend">
        <span><i className="safe-bg" />Safe ({filteredDots.filter(s => s.status === 'SAFE').length})</span>
        <span><i className="caution-bg" />Caution ({filteredDots.filter(s => s.status === 'CAUTION').length})</span>
        <span><i className="blocked-bg" />Blocked ({filteredDots.filter(s => s.status === 'BLOCKED').length})</span>
      </div>
    </div>
  )
}

function TrendChart({ metric }: { metric: string }) {
  let yAxisLabels: string[]
  let values: string
  let currentReading: string

  if (metric === 'TDS (x100 ppm)') {
    yAxisLabels = ['1,500', '1,125', '750', '375', '0']
    values = '8,105 18,98 28,110 38,95 48,92 58,97 68,81 78,88 88,75'
    currentReading = '3.10 ×100 ppm'
  } else if (metric === 'Turbidity (NTU)') {
    yAxisLabels = ['15.0', '11.25', '7.5', '3.75', '0.0']
    values = '8,107 18,98 28,103 38,86 48,91 58,76 68,84 78,61 88,72'
    currentReading = '1.2 NTU'
  } else {
    yAxisLabels = ['10.0', '8.5', '7.0', '5.5', '4.0']
    values = '8,65 18,60 28,63 38,57 48,59 58,54 68,56 78,51 88,53'
    currentReading = '7.2 pH'
  }

  return (
    <div className="trend-chart">
      <div className="chart-y">
        {yAxisLabels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
      <svg viewBox="0 0 100 130" preserveAspectRatio="none" aria-label={`${metric} trend chart`}>
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#155e75" stopOpacity=".16" />
            <stop offset="1" stopColor="#155e75" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="area" d={`M ${values.replaceAll(' ', ' L ')} L 88,120 L 8,120 Z`} />
        <polyline points={values} />
      </svg>
      <div className="chart-x">
        <span>06:00</span>
        <span>08:00</span>
        <span>10:00</span>
        <span>12:00</span>
      </div>
    </div>
  )
}

function StationModal({ station, onClose, onToggleBlock }: { station: WaterStation; onClose: () => void; onToggleBlock: (id: string) => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-subtitle">STATION TELEMETRY INSPECTOR</div>
            <h2>{station.name} Station</h2>
            <p>{station.district} District · Operator: {station.operator}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-status-bar">
            <span>Current Status:</span>
            <StatusPill status={station.status} />
            <span className="muted-text">Last telemetric ping: {station.update}</span>
          </div>

          <div className="param-grid">
            <div className="param-card">
              <div className="param-title"><FlaskConical /> pH Level</div>
              <div className="param-val">{station.ph} <span className="unit">pH</span></div>
              <div className="param-status">{station.ph >= 6.5 && station.ph <= 8.5 ? 'Safe Range (6.5 - 8.5)' : 'Abnormal Range'}</div>
            </div>

            <div className="param-card">
              <div className="param-title"><Gauge /> Total Dissolved Solids</div>
              <div className="param-val">{station.tds} <span className="unit">ppm</span></div>
              <div className="param-status">{station.tds <= 500 ? 'Optimal (< 500)' : station.tds <= 1000 ? 'Caution' : 'Hazardous (> 1000)'}</div>
            </div>

            <div className="param-card">
              <div className="param-title"><Activity /> Turbidity</div>
              <div className="param-val">{station.turbidity} <span className="unit">NTU</span></div>
              <div className="param-status">{station.turbidity <= 5.0 ? 'Clear (< 5.0 NTU)' : 'High Turbidity (> 5.0)'}</div>
            </div>

            <div className="param-card">
              <div className="param-title"><Thermometer /> Water Temp</div>
              <div className="param-val">{station.temp}°C</div>
              <div className="param-status">Standard Range</div>
            </div>

            <div className="param-card">
              <div className="param-title"><Waves /> Flow Rate</div>
              <div className="param-val">{station.flow} <span className="unit">L/min</span></div>
              <div className="param-status">{station.flow > 0 ? 'Active Supply' : 'Valve Diverted'}</div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className={`action-btn ${station.status === 'BLOCKED' ? 'btn-unblock' : 'btn-block'}`}
              onClick={() => onToggleBlock(station.id)}
            >
              {station.status === 'BLOCKED' ? <CheckCircle2 /> : <XCircle />}
              {station.status === 'BLOCKED' ? 'Override & Unblock Supply' : 'Engage Emergency Divert / Block'}
            </button>
            <button className="action-btn btn-secondary" onClick={() => alert(`Automatic sample test initiated for ${station.name} station`)}>
              <FlaskConical /> Trigger Sample Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [stations, setStations] = useState<WaterStation[]>(initialStations)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [stationFilter, setStationFilter] = useState('All')
  const [metric, setMetric] = useState('TDS (x100 ppm)')
  const [district, setDistrict] = useState('All Districts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState<WaterStation | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState('10:24 AM')

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchFilter = stationFilter === 'All' || s.status === stationFilter.toUpperCase()
      const matchDistrict = district === 'All Districts' || s.district === district
      const q = searchQuery.toLowerCase().trim()
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        `ph ${s.ph}`.includes(q) ||
        `tds ${s.tds}`.includes(q)
      return matchFilter && matchDistrict && matchSearch
    })
  }, [stations, stationFilter, district, searchQuery])

  const safeCount = useMemo(() => stations.filter(s => s.status === 'SAFE').length, [stations])
  const cautionCount = useMemo(() => stations.filter(s => s.status === 'CAUTION').length, [stations])
  const blockedCount = useMemo(() => stations.filter(s => s.status === 'BLOCKED').length, [stations])

  const handleToggleBlock = (id: string) => {
    setStations(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'BLOCKED' ? 'SAFE' : 'BLOCKED'
        const updated = {
          ...s,
          status: nextStatus as 'SAFE' | 'BLOCKED',
          flow: nextStatus === 'BLOCKED' ? 0.0 : 18.0,
          tds: nextStatus === 'SAFE' ? 320 : s.tds
        }
        if (selectedStation && selectedStation.id === id) {
          setSelectedStation(updated)
        }
        return updated
      }
      return s
    }))
  }

  const handleSyncData = () => {
    setIsSyncing(true)
    setTimeout(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setLastSync(timeStr)
      setIsSyncing(false)
    }, 600)
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Droplets /></div>
          <div>
            <strong>HYDRAPURE</strong>
            <span>Clean Water<br />Stronger Communities</span>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map(([Icon, label]) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><CircleHelp /><span>Help</span></button>
          <button className="nav-item"><MessageSquare /><span>Feedback</span></button>
          <button className="nav-item"><Settings /><span>Settings</span></button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="search">
            <Search />
            <input
              aria-label="Search dashboard"
              placeholder="Search stations, districts, pH, TDS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X />
              </button>
            )}
          </div>
          <div className="top-actions">
            <button className="round-button"><Search /></button>
            <button className="round-button"><Bell /><i className="notification-dot" /></button>
            <div className="profile">
              <div className="avatar">AY</div>
              <div><strong>Alok Yadav</strong><span>Admin</span></div>
              <ChevronDown />
            </div>
          </div>
        </header>

        <div className="page-heading">
          <div>
            <div className="eyebrow">RURAL WATER SAFETY, REAL IMPACT</div>
            <h1>Welcome back</h1>
            <p>Monitor. Treat. Verify. Supply. Alert. Learn.</p>
            <span className="date-line">Tuesday, 2 September 2026&nbsp;&nbsp; {lastSync}</span>
          </div>
          <div className="heading-actions">
            <span className="online"><i />System Online</span>
            <button className="export-button" onClick={handleSyncData} disabled={isSyncing}>
              <RefreshCw className={isSyncing ? 'spinning' : ''} /> {isSyncing ? 'Syncing...' : 'Sync data'}
            </button>
            <button className="round-button"><MoreHorizontal /></button>
          </div>
        </div>

        <section className="kpi-grid">
          {[
            ['TOTAL STATIONS', String(stations.length), '+2 this month', 'Active monitoring stations across Jharkhand', Radio, 'up'],
            ['SAFE SUPPLY', String(safeCount), `${Math.round((safeCount / stations.length) * 100)}% of total`, 'Water verified and ready for supply', ShieldCheck, 'safe'],
            ['UNDER CAUTION', String(cautionCount), `${Math.round((cautionCount / stations.length) * 100)}% of total`, 'Treatment or operator review needed', CircleAlert, 'caution'],
            ['SUPPLY BLOCKED', String(blockedCount), `${Math.round((blockedCount / stations.length) * 100)}% of total`, 'Automatic block-divert engaged', XCircle, 'blocked'],
          ].map(([label, value, sub, desc, Icon, tone]) => (
            <article className="kpi-card" key={label as string}>
              <div className={`kpi-icon ${tone}`}><Icon /></div>
              <span className="kpi-label">{label as string}</span>
              <div className="kpi-value-row">
                <strong>{value as string}</strong>
                <span>{sub as string}</span>
                <ArrowUpRight className="metric-arrow" />
              </div>
              <p>{desc as string}</p>
            </article>
          ))}
        </section>

        <div className="dashboard-grid">
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
                  <option>All Districts</option>
                  <option>Dhanbad</option>
                  <option>Ranchi</option>
                  <option>Jamshedpur</option>
                  <option>Bokaro</option>
                  <option>Hazaribagh</option>
                </select>
                <CardMenu />
              </div>
            </div>

            <div className="station-tabs">
              {['All', 'Safe', 'Caution', 'Blocked'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStationFilter(tab)}
                  className={stationFilter === tab ? 'selected' : ''}
                >
                  {tab}
                </button>
              ))}
            </div>

            <StationMap
              stations={stations}
              filter={stationFilter}
              searchQuery={searchQuery}
              district={district}
            />

            <div className="station-foot">
              <span><Radio /> {stations.length} stations reporting</span>
              <span><Zap /> Auto block-divert enabled</span>
              <span>Last sync {lastSync}</span>
            </div>
          </section>

          <section className="card alerts-card">
            <div className="card-header">
              <div>
                <h2>Recent Alerts</h2>
                <p>Events requiring attention</p>
              </div>
              <button className="view-link">View All <ArrowUpRight /></button>
            </div>
            <div className="alerts-list">
              {[
                ['High TDS detected — Baghmara', 'Supply blocked automatically', '10:15 AM', 'blocked', XCircle],
                ['Turbidity above limit — Katras', 'Under caution', '09:42 AM', 'caution', CircleAlert],
                ['System back online — Govindpur', 'Water quality normal', '08:30 AM', 'safe', CheckCircle2],
                ['Low pH detected — Barhi', 'Supply blocked automatically', '07:18 AM', 'blocked', XCircle],
              ].map(([title, sub, time, tone, Icon]) => (
                <div className="alert-row" key={title as string}>
                  <div className={`alert-icon ${tone}`}><Icon /></div>
                  <div>
                    <strong>{title as string}</strong>
                    <span>{sub as string}</span>
                  </div>
                  <time>{time as string}</time>
                </div>
              ))}
            </div>
            <div className="logic-strip">
              <span><FlaskConical /> Sense</span><b>→</b>
              <span>Analyze</span><b>→</b>
              <span>Treat</span><b>→</b>
              <span>Verify</span><b>→</b>
              <span>Supply / Block</span>
            </div>
          </section>

          <section className="card table-card">
            <div className="card-header">
              <div>
                <h2>Stations Overview</h2>
                <p>Latest readings from filtered stations ({filteredStations.length})</p>
              </div>
              <button className="view-link" onClick={() => { setStationFilter('All'); setDistrict('All Districts'); setSearchQuery(''); }}>
                Reset Filters <ArrowUpRight />
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Village / Location</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Key Parameters</th>
                    <th>Last Update</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map(s => (
                    <tr key={s.id}>
                      <td className="muted-cell">{s.id}</td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.district}</td>
                      <td><StatusPill status={s.status} /></td>
                      <td className="params">{`pH ${s.ph} | TDS ${s.tds} | Turb ${s.turbidity}`}</td>
                      <td className="muted-cell">{s.update}</td>
                      <td>
                        <button
                          className="view-text"
                          onClick={() => setSelectedStation(s)}
                        >
                          <Eye className="inline-icon" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStations.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No stations match your current search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card trends-card">
            <div className="card-header">
              <div>
                <h2>Water Quality Trends</h2>
                <p>Jharia station · readings today</p>
              </div>
              <div className="header-controls">
                <select aria-label="Select station">
                  <option>Jharia</option>
                  <option>Govindpur</option>
                  <option>Katras</option>
                </select>
                <CardMenu />
              </div>
            </div>
            <div className="metric-tabs">
              {['TDS (x100 ppm)', 'Turbidity (NTU)', 'pH'].map(tab => (
                <button
                  key={tab}
                  className={metric === tab ? 'selected' : ''}
                  onClick={() => setMetric(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <TrendChart metric={metric} />
            <div className="sensor-footer">
              <span>
                <Gauge /> Current reading <b>{metric === 'pH' ? '7.2 pH' : metric === 'Turbidity (NTU)' ? '1.2 NTU' : '3.10 ×100 ppm'}</b>
              </span>
              <span><Thermometer /> 24.8°C</span>
              <span><Waves /> 18.4 L/min flow</span>
            </div>
          </section>
        </div>
      </section>

      {selectedStation && (
        <StationModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onToggleBlock={handleToggleBlock}
        />
      )}
    </main>
  )
}
