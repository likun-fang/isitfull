'use client'

import type { Rvm } from '@/lib/types'
import dynamic from 'next/dynamic'

interface MapViewProps {
  rvms: Rvm[]
}

const MapInner = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400">Loading map...</p>
    </div>
  ),
})

export function MapView({ rvms }: MapViewProps) {
  return <MapInner rvms={rvms} />
}
