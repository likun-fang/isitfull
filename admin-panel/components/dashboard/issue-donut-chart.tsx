'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface IssueDonutChartProps {
  pending: number
  resolved: number
  ignored: number
}

const COLORS = ['#F59E0B', '#22C55E', '#9CA3AF']

export function IssueDonutChart({ pending, resolved, ignored }: IssueDonutChartProps) {
  const data = [
    { name: 'Pending', value: pending },
    { name: 'Resolved', value: resolved },
    { name: 'Ignored', value: ignored },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        No issue data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
