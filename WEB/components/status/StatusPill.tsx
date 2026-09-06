import type { StationStatus, QualityStatus, AlertLevel } from '@/lib/types'

type PillStatus = StationStatus | QualityStatus | AlertLevel | string

const toneMap: Record<string, string> = {
  SAFE: 'safe', Good: 'safe', resolved: 'safe',
  CAUTION: 'caution', Caution: 'caution', warning: 'caution',
  BLOCKED: 'blocked', Poor: 'blocked', critical: 'blocked',
  info: 'info',
}

export default function StatusPill({ status, size = 'default' }: { status: PillStatus; size?: 'default' | 'sm' | 'lg' }) {
  const tone = toneMap[status] || 'info'
  const label = status === 'SAFE' ? 'Safe' : status === 'BLOCKED' ? 'Blocked' : status === 'CAUTION' ? 'Caution' : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`status-pill ${tone} ${size === 'lg' ? 'pill-lg' : size === 'sm' ? 'pill-sm' : ''}`}>
      <span className="status-dot" />
      {label}
    </span>
  )
}
