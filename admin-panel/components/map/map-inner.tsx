'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Rvm } from '@/lib/types'

interface MapInnerProps {
  rvms: Rvm[]
}

const CENTER: L.LatLngExpression = [53.35, -6.26]

function getMarkerColor(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return '#22C55E'
    case 'BUSY':
      return '#F59E0B'
    case 'BROKEN':
      return '#EF4444'
    case 'REMOVED':
      return '#6B7280'
    default:
      return '#9CA3AF'
  }
}

export default function MapInner({ rvms }: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView(CENTER, 7)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const markers: L.CircleMarker[] = []

    rvms.forEach((rvm) => {
      const marker = L.circleMarker([rvm.latitude, rvm.longitude], {
        radius: 8,
        fillColor: getMarkerColor(rvm.status),
        fillOpacity: 0.9,
        color: '#fff',
        weight: 2,
      }).addTo(map)

      marker.bindPopup(
        `<div style="font-size:14px">` +
          `<p style="font-weight:600;margin:0">${rvm.name}</p>` +
          `<p style="color:#6b7280;margin:2px 0">${rvm.city}</p>` +
          `<p style="margin:4px 0 0">Status: <strong>${rvm.status}</strong></p>` +
          (rvm.statusUpdatedAt
            ? `<p style="font-size:12px;color:#9ca3af;margin:4px 0 0">Updated: ${new Date(rvm.statusUpdatedAt).toLocaleString()}</p>`
            : '') +
          `</div>`
      )

      markers.push(marker)
    })

    return () => {
      markers.forEach((m) => m.remove())
    }
  }, [rvms])

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}
