'use client'

import { useAllRvms } from '@/lib/queries/rvms'
import { MapView } from '@/components/map/map-view'
import { Skeleton } from '@/components/ui/skeleton'

export default function MapPage() {
  const { data: rvms, isLoading } = useAllRvms()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Map Monitor</h1>
        {rvms && (
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Busy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Broken
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
              Unknown
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <MapView rvms={rvms ?? []} />
        )}
      </div>
    </div>
  )
}
