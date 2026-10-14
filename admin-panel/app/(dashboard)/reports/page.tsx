'use client'

import { useState } from 'react'
import { useReports, useDeleteReport } from '@/lib/queries/reports'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft, ChevronRight, Trash2, Search, CheckCircle, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { RvmStatus } from '@/lib/types'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'Broken', value: 'BROKEN' },
  { label: 'Unknown', value: 'UNKNOWN' },
] as const

function getStatusVariant(status: RvmStatus) {
  switch (status) {
    case 'AVAILABLE': return 'success' as const
    case 'BUSY': return 'warning' as const
    case 'BROKEN': return 'danger' as const
    case 'UNKNOWN': return 'neutral' as const
    default: return 'neutral' as const
  }
}

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [rvmIdFilter, setRvmIdFilter] = useState('')
  const [page, setPage] = useState(1)
  const size = 20

  const { data, isLoading } = useReports(statusFilter, rvmIdFilter, page, size)
  const reports = data?.data ?? []
  const meta = data?.meta

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteMutation = useDeleteReport()

  const handleDelete = () => {
    if (deleteId === null) return
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Report deleted')
        setDeleteId(null)
      },
      onError: () => toast.error('Failed to delete report'),
    })
  }

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Status Reports{' '}
          {meta?.total !== undefined && (
            <span className="text-base font-normal text-gray-400">
              ({meta.total.toLocaleString()})
            </span>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-4">
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
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter by RVM ID..."
            value={rvmIdFilter}
            onChange={(e) => {
              setRvmIdFilter(e.target.value)
              setPage(1)
            }}
            className="w-40 pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-500 uppercase">ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">RVM</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Reporter</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Verified</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Queue</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Distance</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-gray-400">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium text-gray-900">#{report.id}</TableCell>
                  <TableCell className="text-sm">
                    <div className="text-gray-900">{report.rvm_name || `RVM #${report.rvm_id}`}</div>
                    {report.rvm_city && <div className="text-xs text-gray-400">{report.rvm_city}</div>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="text-gray-900">{report.reporter_name || 'Anonymous'}</div>
                    {report.reporter_email && <div className="text-xs text-gray-400">{report.reporter_email}</div>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={report.status} variant={getStatusVariant(report.status)} />
                  </TableCell>
                  <TableCell>
                    {report.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-xs text-gray-400">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {report.queue_length?.replace(/_/g, ' ') || '\u2014'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {report.distance_meters != null ? `${report.distance_meters}m` : '\u2014'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(report.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1} className="cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (meta.totalPages ?? 1)} className="cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete report <strong>#{deleteId}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="cursor-pointer bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}