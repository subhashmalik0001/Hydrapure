'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { chartData, parameterConfig, type TimeRange, type ChartParameter } from '@/lib/data/chart-data'

interface WaterQualityChartProps {
  defaultParameter?: ChartParameter
  showRangeSelector?: boolean
  showParameterTabs?: boolean
}

export default function WaterQualityChart({
  defaultParameter = 'tds',
  showRangeSelector = true,
  showParameterTabs = true,
}: WaterQualityChartProps) {
  const [range, setRange] = useState<TimeRange>('24H')
  const [parameter, setParameter] = useState<ChartParameter>(defaultParameter)

  const data = chartData[range]
  const config = parameterConfig[parameter]

  const ranges: TimeRange[] = ['24H', '7D', '30D']
  const params: ChartParameter[] = ['ph', 'tds', 'turbidity', 'temperature', 'chlorine']

  return (
    <div>
      <div className="chart-controls">
        {showParameterTabs && (
          <div className="metric-tabs">
            {params.map(p => (
              <button
                key={p}
                className={parameter === p ? 'selected' : ''}
                onClick={() => setParameter(p)}
              >
                {parameterConfig[p].label}
              </button>
            ))}
          </div>
        )}
        {showRangeSelector && (
          <div className="range-tabs">
            {ranges.map(r => (
              <button
                key={r}
                className={range === r ? 'selected' : ''}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="recharts-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${parameter}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf1f3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#adb7bd' }}
              axisLine={{ stroke: '#edf1f3' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={config.domain}
              tick={{ fontSize: 10, fill: '#adb7bd' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any) => [`${value ?? ''} ${config.unit}`, config.label]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey={parameter}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#grad-${parameter})`}
              dot={false}
              activeDot={{ r: 4, fill: config.color, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
