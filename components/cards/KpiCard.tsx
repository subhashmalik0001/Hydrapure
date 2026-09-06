import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  subtitle: string
  description: string
  icon: LucideIcon
  tone?: 'up' | 'safe' | 'caution' | 'blocked'
}

export default function KpiCard({ label, value, subtitle, description, icon: Icon, tone = 'up' }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${tone}`}><Icon /></div>
      <span className="kpi-label">{label}</span>
      <div className="kpi-value-row">
        <strong>{value}</strong>
        <span>{subtitle}</span>
        <ArrowUpRight className="metric-arrow" />
      </div>
      <p>{description}</p>
    </article>
  )
}
