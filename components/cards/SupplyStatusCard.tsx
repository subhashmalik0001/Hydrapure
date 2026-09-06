import { Droplets, CheckCircle2, XCircle, Clock, Home, Activity } from 'lucide-react'

interface SupplyStatusCardProps {
  active: boolean
  flowRate: number
  households: number
  since: string
  stationName?: string
}

export default function SupplyStatusCard({
  active,
  flowRate,
  households,
  since,
  stationName,
}: SupplyStatusCardProps) {
  return (
    <div className="supply-card">
      <div className="supply-card-header">
        <div className="supply-title-group">
          <div className={`supply-badge-icon ${active ? 'active' : 'blocked'}`}>
            <Droplets />
          </div>
          <div>
            <h3>Water Supply Status</h3>
            {stationName && <span className="supply-subtext">{stationName} Station</span>}
          </div>
        </div>
        <div className={`supply-status-pill ${active ? 'safe' : 'blocked'}`}>
          {active ? <CheckCircle2 /> : <XCircle />}
          <span>{active ? 'Supply Active' : 'Supply Cut Off (Blocked)'}</span>
        </div>
      </div>

      <div className="supply-stats-grid">
        <div className="supply-stat-item">
          <div className="stat-label">
            <Activity />
            <span>Current Flow</span>
          </div>
          <div className="stat-value">
            {flowRate} <span className="stat-unit">L/s</span>
          </div>
          <span className="stat-hint">{active ? 'Normal operating rate' : 'Valve locked closed'}</span>
        </div>

        <div className="supply-stat-item">
          <div className="stat-label">
            <Home />
            <span>Households Served</span>
          </div>
          <div className="stat-value">
            {households.toLocaleString()} <span className="stat-unit">families</span>
          </div>
          <span className="stat-hint">Community piped tap connection</span>
        </div>

        <div className="supply-stat-item">
          <div className="stat-label">
            <Clock />
            <span>Supply Window</span>
          </div>
          <div className="stat-value text-base">
            {since !== '—' ? `Since ${since}` : 'Currently Suspended'}
          </div>
          <span className="stat-hint">Scheduled: 06:00 AM – 11:30 AM</span>
        </div>
      </div>
    </div>
  )
}
