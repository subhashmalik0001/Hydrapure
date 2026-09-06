import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  range?: string
  status: string
  statusTone?: 'safe' | 'caution' | 'blocked'
}

export default function MetricCard({ icon: Icon, label, value, unit, range, status, statusTone = 'safe' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <Icon />
        <span>{label}</span>
      </div>
      <div className="metric-card-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {range && <div className="metric-range">{range}</div>}
      <div className={`metric-status ${statusTone}`}>{status}</div>
    </div>
  )
}
