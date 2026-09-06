'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import type { WaterStation } from '@/lib/types'
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, Maximize2, ExternalLink } from 'lucide-react'
import '@maptiler/sdk/dist/maptiler-sdk.css'

const MAPTILER_KEY = 'n4qENepNOO8fvKkEkGPo'
// Center coordinates
const JHARKHAND_CENTER: [number, number] = [85.9, 23.75] // [lng, lat]
const INDIA_CENTER: [number, number] = [82.40523, 23.5]

interface StationMapProps {
  stations: WaterStation[]
  filter?: string
  district?: string
  searchQuery?: string
  height?: number | string
  interactive?: boolean
  selectedStationId?: string
  onSelectStation?: (station: WaterStation) => void
}

export default function StationMap({
  stations,
  filter = 'All',
  district = 'All Districts',
  searchQuery = '',
  height = 240,
  interactive = true,
  selectedStationId,
  onSelectStation,
}: StationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeStation, setActiveStation] = useState<WaterStation | null>(null)

  // Filter stations based on props
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchFilter = filter === 'All' || s.status === filter.toUpperCase()
      const matchDistrict = district === 'All Districts' || s.district === district
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.stationId.toLowerCase().includes(q)
      return matchFilter && matchDistrict && matchSearch
    })
  }, [stations, filter, district, searchQuery])

  // Initialize MapTiler map
  useEffect(() => {
    if (!mapContainerRef.current) return
    let isMounted = true

    async function initMapTiler() {
      try {
        const maptilersdk = await import('@maptiler/sdk')
        maptilersdk.config.apiKey = MAPTILER_KEY

        if (!mapContainerRef.current || !isMounted) return

        const map = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: `https://api.maptiler.com/maps/base-v4/style.json?key=${MAPTILER_KEY}`,
          center: JHARKHAND_CENTER,
          zoom: 7.8,
          navigationControl: false, // We render custom minimal controls
          geolocateControl: false,
          fullscreenControl: false,
        })

        mapInstanceRef.current = map

        map.on('load', () => {
          if (!isMounted) return
          setMapLoaded(true)
          map.resize()
        })
      } catch (err) {
        console.error('Failed to initialize MapTiler:', err)
      }
    }

    initMapTiler()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Sync Markers when filteredStations or mapLoaded changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return

    let isMounted = true

    async function updateMarkers() {
      const maptilersdk = await import('@maptiler/sdk')
      if (!isMounted || !mapInstanceRef.current) return

      // Clear existing markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Create new markers
      filteredStations.forEach(station => {
        // Validate coordinates
        if (!station.latitude || !station.longitude) return

        // Create marker DOM element
        const el = document.createElement('div')
        const isSelected = selectedStationId === station.id || activeStation?.id === station.id
        const tone = station.status.toLowerCase()

        el.className = `maptiler-station-marker marker-${tone} ${isSelected ? 'selected-marker' : ''}`
        el.title = `${station.name} (${station.district}) - ${station.status}`

        el.innerHTML = `
          <div class="marker-core ${tone}">
            <div class="marker-inner-dot"></div>
          </div>
          <div class="marker-label">${station.name}</div>
        `

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setActiveStation(station)
          if (onSelectStation) {
            onSelectStation(station)
          }
          mapInstanceRef.current?.flyTo({
            center: [station.longitude, station.latitude],
            zoom: Math.max(mapInstanceRef.current.getZoom(), 9.5),
            duration: 800,
          })
        })

        const marker = new maptilersdk.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .addTo(mapInstanceRef.current)

        markersRef.current.push(marker)
      })
    }

    updateMarkers()

    return () => {
      isMounted = false
    }
  }, [filteredStations, mapLoaded, selectedStationId, activeStation, onSelectStation])

  // Fly to selected station if changed externally
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStationId) return
    const target = stations.find(s => s.id === selectedStationId || s.stationId === selectedStationId)
    if (target && target.latitude && target.longitude) {
      mapInstanceRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 10.5,
        duration: 900,
      })
      setActiveStation(target)
    }
  }, [selectedStationId, stations])

  // Map control helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleResetJharkhand = () => {
    mapInstanceRef.current?.flyTo({
      center: JHARKHAND_CENTER,
      zoom: 7.8,
      duration: 1000,
    })
  }
  const handleViewIndia = () => {
    mapInstanceRef.current?.flyTo({
      center: INDIA_CENTER,
      zoom: 4.6,
      duration: 1200,
    })
  }

  const safeCount = filteredStations.filter(s => s.status === 'SAFE').length
  const cautionCount = filteredStations.filter(s => s.status === 'CAUTION').length
  const blockedCount = filteredStations.filter(s => s.status === 'BLOCKED').length

  return (
    <div
      className="maptiler-map-wrapper"
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* MapTiler Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#edf2f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            fontSize: '12px',
            color: '#64748b',
            fontWeight: 500,
            gap: 8,
          }}
        >
          <div className="spinning" style={{ width: 16, height: 16, border: '2px solid #155e75', borderTopColor: 'transparent', borderRadius: '50%' }} />
          <span>Loading MapTiler Base Map (Jharkhand, India)...</span>
        </div>
      )}

      {/* Custom Map Navigation Controls (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 5,
        }}
      >
        <button
          onClick={handleZoomIn}
          className="map-ctrl-btn"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={handleZoomOut}
          className="map-ctrl-btn"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={handleResetJharkhand}
          className="map-ctrl-btn"
          title="Focus Jharkhand"
          style={{ fontSize: '10px', fontWeight: 700, padding: '4px' }}
        >
          JH
        </button>
        <button
          onClick={handleViewIndia}
          className="map-ctrl-btn"
          title="View All India"
          style={{ fontSize: '10px', fontWeight: 700, padding: '4px' }}
        >
          IND
        </button>
      </div>

      {/* Selected Station Telemetry Popup Card */}
      {activeStation && (
        <div
          className="map-overlay-popup"
          style={{
            position: 'absolute',
            bottom: 34,
            left: 12,
            background: 'white',
            borderRadius: '14px',
            padding: '12px 14px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
            border: '1px solid #cbd5e1',
            zIndex: 20,
            width: '240px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{activeStation.name} Station</strong>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{activeStation.district} • {activeStation.stationId}</span>
            </div>
            <button
              onClick={() => setActiveStation(null)}
              style={{ background: 'transparent', border: 0, padding: 2, color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 8px' }}>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: '8px',
                background: activeStation.status === 'SAFE' ? '#eaf7f0' : activeStation.status === 'CAUTION' ? '#fff6e6' : '#ffefef',
                color: activeStation.status === 'SAFE' ? '#18845b' : activeStation.status === 'CAUTION' ? '#c48216' : '#d45252',
              }}
            >
              ● {activeStation.status}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>
              {activeStation.latitude.toFixed(2)}°N, {activeStation.longitude.toFixed(2)}°E
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, background: '#f8fafc', padding: '6px 4px', borderRadius: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>pH</div>
              <strong style={{ fontSize: '11px', color: '#0f172a' }}>{activeStation.ph.toFixed(1)}</strong>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>TDS</div>
              <strong style={{ fontSize: '11px', color: activeStation.tds > 500 ? '#d45252' : '#0f172a' }}>{activeStation.tds}</strong>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Turb</div>
              <strong style={{ fontSize: '11px', color: activeStation.turbidity > 5 ? '#d45252' : '#0f172a' }}>{activeStation.turbidity}</strong>
            </div>
          </div>

          <Link
            href={`/stations/${activeStation.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: '11px',
              fontWeight: 600,
              color: '#155e75',
              marginTop: 8,
              textDecoration: 'none',
              padding: '5px 0',
              background: '#f0f9ff',
              borderRadius: '6px',
            }}
          >
            <span>View Full Details</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* Legend at Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: 10,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '4px 10px',
          borderRadius: '20px',
          display: 'flex',
          gap: 12,
          fontSize: '10px',
          color: '#475569',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          zIndex: 4,
          alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <i style={{ width: 7, height: 7, borderRadius: '50%', background: '#18845b', display: 'inline-block' }} />
          Safe ({safeCount})
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <i style={{ width: 7, height: 7, borderRadius: '50%', background: '#c48216', display: 'inline-block' }} />
          Caution ({cautionCount})
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <i style={{ width: 7, height: 7, borderRadius: '50%', background: '#d45252', display: 'inline-block' }} />
          Blocked ({blockedCount})
        </span>
      </div>
    </div>
  )
}
