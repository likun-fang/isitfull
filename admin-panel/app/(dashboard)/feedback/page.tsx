'use client'

import { useState } from 'react'
import { useFeedback } from '@/lib/queries/feedback'
import { StatusBadge } from '@/components/shared/status-badge'
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import Image from 'next/image'

const TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Bugs', value: 'BUG' },
  { label: 'Features', value: 'FEATURE' },
]

function getTypeVariant(type: string) {
  switch (type) {
    case 'BUG':
      return 'danger' as const
    case 'FEATURE':
      return 'info' as const
    default:
      return 'neutral' as const
  }
}

export default function FeedbackPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const size = 20

  const { data, isLoading } = useFeedback(typeFilter, page, size)
  const items = data?.data ?? []
  const meta = data?.meta

  const handleFilterChange = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback{' '}
          {meta?.total !== undefined && (
            <span className="text-base font-normal text-gray-400">
              ({meta.total.toLocaleString()})
            </span>
          )}
        </h1>
      </div>

      <div className="flex gap-2">
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={typeFilter === filter.value ? 'default' : 'outline'}
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
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Type</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">User</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Message</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Screenshot</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-gray-400"
                >
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">
                    #{item.id}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={item.type}
                      variant={getTypeVariant(item.type)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="text-gray-900">
                      {item.reporter_name || 'Anonymous'}
                    </div>
                    {item.reporter_email && (
                      <div className="text-xs text-gray-400">
                        {item.reporter_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 max-w-md">
                    <p className="line-clamp-2">{item.message}</p>
                  </TableCell>
                  <TableCell>
                    {item.screenshot_url ? (
                      <button
                        onClick={() => setPreviewUrl(item.screenshot_url!)}
                        className="group relative cursor-pointer"
                      >
                        <Image
                          src={item.screenshot_url}
                          alt="Screenshot"
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 rounded-md object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-emerald-400 transition-all"
                        />
                      </button>
                    ) : (
                      <span className="text-gray-300">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Screenshot Preview</DialogTitle>
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Feedback screenshot"
              width={600}
              height={400}
              unoptimized
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}