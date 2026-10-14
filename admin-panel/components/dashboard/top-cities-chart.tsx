'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Rvm } from '@/lib/types'

interface TopCitiesChartProps {
  rvms: Rvm[]
}

export function TopCitiesChart({ rvms }: TopCitiesChartProps) {
  const counts: Record<string, number> = {}
  rvms.forEach((r) => {
    const city = r.city || 'Unknown'
    counts[city] = (counts[city] || 0) + 1
  })

  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }))

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        No city data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="city"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
          }}
        />
        <Bar dataKey="count" fill="#22C55E" radius={[0, 6, 6, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
