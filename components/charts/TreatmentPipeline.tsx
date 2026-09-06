import type { TreatmentStage } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

interface TreatmentPipelineProps {
  stages: TreatmentStage[]
}

const statusColors: Record<string, string> = {
  Running: 'safe',
  Normal: 'safe',
  Good: 'safe',
  Idle: 'caution',
  Error: 'blocked',
}

export default function TreatmentPipeline({ stages }: TreatmentPipelineProps) {
  return (
    <div className="treatment-pipeline">
      {stages.map((stage, i) => (
        <div key={stage.name} className="pipeline-step">
          <div className={`pipeline-node ${statusColors[stage.status] || 'info'}`}>
            <div className="pipeline-node-dot" />
            <div className="pipeline-node-label">{stage.name}</div>
            <div className={`pipeline-node-status ${statusColors[stage.status] || 'info'}`}>
              {stage.label}
            </div>
          </div>
          {i < stages.length - 1 && (
            <div className="pipeline-arrow">
              <ArrowRight />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
