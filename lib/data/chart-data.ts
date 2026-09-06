import type { WaterQualityDataPoint } from '@/lib/types'

// Generate 24-hour data (hourly readings)
function generate24HData(): WaterQualityDataPoint[] {
  const base = { ph: 7.2, tds: 310, turbidity: 1.2, temperature: 24.8, chlorine: 0.5 }
  const points: WaterQualityDataPoint[] = []
  for (let h = 0; h < 24; h++) {
    const hour = h.toString().padStart(2, '0')
    points.push({
      time: `${hour}:00`,
      ph: +(base.ph + (Math.sin(h / 4) * 0.3) + (Math.random() - 0.5) * 0.1).toFixed(2),
      tds: Math.round(base.tds + Math.sin(h / 3) * 40 + (Math.random() - 0.5) * 20),
      turbidity: +(base.turbidity + Math.sin(h / 5) * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(2),
      temperature: +(base.temperature + Math.sin((h - 6) / 4) * 2 + (Math.random() - 0.5) * 0.3).toFixed(1),
      chlorine: +(base.chlorine + (Math.random() - 0.5) * 0.1).toFixed(2),
    })
  }
  return points
}

// Generate 7-day data (4 readings per day)
function generate7DData(): WaterQualityDataPoint[] {
  const days = ['27 Aug', '28 Aug', '29 Aug', '30 Aug', '31 Aug', '01 Sep', '02 Sep']
  const base = { ph: 7.15, tds: 330, turbidity: 1.4, temperature: 25.0, chlorine: 0.45 }
  const points: WaterQualityDataPoint[] = []
  days.forEach((day, di) => {
    for (let q = 0; q < 4; q++) {
      const hours = ['06:00', '10:00', '14:00', '18:00']
      points.push({
        time: `${day} ${hours[q]}`,
        ph: +(base.ph + Math.sin((di * 4 + q) / 5) * 0.4 + (Math.random() - 0.5) * 0.15).toFixed(2),
        tds: Math.round(base.tds + Math.sin((di * 4 + q) / 4) * 60 + (Math.random() - 0.5) * 30),
        turbidity: +(base.turbidity + Math.sin((di * 4 + q) / 6) * 0.6 + (Math.random() - 0.5) * 0.3).toFixed(2),
        temperature: +(base.temperature + Math.sin((di * 4 + q - 8) / 5) * 2.5 + (Math.random() - 0.5) * 0.4).toFixed(1),
        chlorine: +(base.chlorine + (Math.random() - 0.5) * 0.12).toFixed(2),
      })
    }
  })
  return points
}

// Generate 30-day data (daily averages)
function generate30DData(): WaterQualityDataPoint[] {
  const base = { ph: 7.1, tds: 350, turbidity: 1.5, temperature: 25.2, chlorine: 0.42 }
  const points: WaterQualityDataPoint[] = []
  for (let d = 0; d < 30; d++) {
    const day = (d + 4).toString().padStart(2, '0')
    const month = d < 28 ? 'Aug' : 'Sep'
    const dayNum = d < 28 ? d + 4 : d - 27
    points.push({
      time: `${dayNum.toString().padStart(2, '0')} ${month}`,
      ph: +(base.ph + Math.sin(d / 7) * 0.5 + (Math.random() - 0.5) * 0.2).toFixed(2),
      tds: Math.round(base.tds + Math.sin(d / 6) * 80 + (Math.random() - 0.5) * 40),
      turbidity: +(base.turbidity + Math.sin(d / 8) * 0.8 + (Math.random() - 0.5) * 0.4).toFixed(2),
      temperature: +(base.temperature + Math.sin(d / 10) * 3 + (Math.random() - 0.5) * 0.5).toFixed(1),
      chlorine: +(base.chlorine + (Math.random() - 0.5) * 0.15).toFixed(2),
    })
  }
  return points
}

// Pre-generate with stable seed-like data
export const chartData = {
  '24H': generate24HData(),
  '7D': generate7DData(),
  '30D': generate30DData(),
}

export type TimeRange = keyof typeof chartData
export type ChartParameter = 'ph' | 'tds' | 'turbidity' | 'temperature' | 'chlorine'

export const parameterConfig: Record<ChartParameter, { label: string; unit: string; color: string; domain: [number, number] }> = {
  ph: { label: 'pH', unit: 'pH', color: '#155e75', domain: [5, 9] },
  tds: { label: 'TDS', unit: 'ppm', color: '#155e75', domain: [0, 1600] },
  turbidity: { label: 'Turbidity', unit: 'NTU', color: '#155e75', domain: [0, 15] },
  temperature: { label: 'Temperature', unit: '°C', color: '#155e75', domain: [20, 30] },
  chlorine: { label: 'Residual Chlorine', unit: 'mg/L', color: '#155e75', domain: [0, 1] },
}
