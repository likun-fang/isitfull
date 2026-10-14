'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Rvm } from '@/lib/types'

interface RvmStatusChartProps {
  rvms: Rvm[]
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#22C55E',
  BUSY: '#F59E0B',
  BROKEN: '#EF4444',
  UNKNOWN: '#9CA3AF',
  REMOVED: '#6B7280',
}

const STATUS_ORDER = ['AVAILABLE', 'BUSY', 'BROKEN', 'UNKNOWN', 'REMOVED']

export function RvmStatusChart({ rvms }: RvmStatusChartProps) {
  const counts: Record<string, number> = {}
  rvms.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1
  })

  const data = STATUS_ORDER.map((s) => ({
    name: s.charAt(0) + s.slice(1).toLowerCase(),
    value: counts[s] || 0,
    status: s,
  }))

  if (rvms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        No RVM data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
