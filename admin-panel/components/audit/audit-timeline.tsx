import { cn } from '@/lib/utils'
import type { AuditLog } from '@/lib/types'

function getDotColor(action: string): string {
  const upper = action.toUpperCase()
  if (upper.includes('LOGIN')) return 'bg-blue-500'
  if (upper.includes('BAN')) return 'bg-red-500'
  if (upper.includes('RESOLVE')) return 'bg-green-500'
  if (upper.includes('CREATE') || upper.includes('IMPORT')) return 'bg-emerald-500'
  if (upper.includes('DELETE')) return 'bg-red-400'
  if (upper.includes('KARMA')) return 'bg-amber-500'
  return 'bg-gray-400'
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

interface AuditTimelineProps {
  logs: AuditLog[]
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  return (
    <div className="relative">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'h-3 w-3 rounded-full shrink-0 mt-1',
                getDotColor(log.action)
              )}
            />
            {index < logs.length - 1 && (
              <div className="flex-1 border-l-2 border-gray-200 mt-1" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {log.action}
            </p>
            {(log.targetType || log.targetId !== null) && (
              <p className="text-xs text-gray-500">
                {log.targetType} #{log.targetId}
              </p>
            )}
            {log.details && (
              <p className="text-xs text-gray-600 mt-0.5">
                {truncate(log.details, 200)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                Admin #{log.adminId}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
