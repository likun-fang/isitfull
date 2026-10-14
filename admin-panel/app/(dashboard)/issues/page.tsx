'use client'

import { useState } from 'react'
import { useIssues, useResolveIssue } from '@/lib/queries/issues'
import { StatusBadge } from '@/components/shared/status-badge'
import { ResolveDialog } from '@/components/issues/resolve-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { IssueResolution } from '@/lib/types'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Ignored', value: 'IGNORED' },
] as const

function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'warning' as const
    case 'RESOLVED':
      return 'success' as const
    case 'IGNORED':
      return 'neutral' as const
    default:
      return 'neutral' as const
  }
}

export default function IssuesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const size = 20

  const { data, isLoading } = useIssues(statusFilter, page, size)
  const issues = data?.data ?? []
  const meta = data?.meta

  const [resolveId, setResolveId] = useState<number | null>(null)
  const resolveMutation = useResolveIssue()

  const handleResolve = (resolution: IssueResolution, note: string) => {
    if (resolveId === null) return
    resolveMutation.mutate(
      { id: resolveId, resolution, note: note || undefined },
      {
        onSuccess: () => {
          toast.success('Issue resolved successfully')
          setResolveId(null)
        },
        onError: () => toast.error('Failed to resolve issue'),
      }
    )
  }

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Issues{' '}
          {meta?.total !== undefined && (
            <span className="text-base font-normal text-gray-400">
              ({meta.total.toLocaleString()})
            </span>
          )}
        </h1>
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(filter.value)}
            className="cursor-pointer"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-500 uppercase">ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">RVM</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Reporter</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Reason</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : issues.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-gray-400"
                >
                  No issues found
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow
                  key={issue.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <TableCell className="font-medium text-gray-900">
                    #{issue.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="text-gray-900">
                      {issue.rvm_name || `RVM #${issue.rvm_id}`}
                    </div>
                    {issue.rvm_city && (
                      <div className="text-xs text-gray-400">
                        {issue.rvm_city}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="text-gray-900">
                      {issue.reporter_name || 'Anonymous'}
                    </div>
                    {issue.reporter_email && (
                      <div className="text-xs text-gray-400">
                        {issue.reporter_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {issue.reason.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={issue.status}
                      variant={getStatusVariant(issue.status)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {issue.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        onClick={() => setResolveId(issue.id)}
                        className="bg-green-500 hover:bg-green-600 cursor-pointer"
                      >
                        Resolve
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {issue.resolution || '\u2014'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (meta.totalPages ?? 1)}
                className="cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ResolveDialog
        open={resolveId !== null}
        onOpenChange={(open) => {
          if (!open) setResolveId(null)
        }}
        issueId={resolveId}
        onConfirm={handleResolve}
        isPending={resolveMutation.isPending}
      />
    </div>
  )
}
