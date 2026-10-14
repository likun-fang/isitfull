'use client'

import { useState, useMemo } from 'react'
import { useAllRvms, useCreateRvm, useUpdateRvm, useDeleteRvm, useSyncRvms, useUpdateRvmStatus } from '@/lib/queries/rvms'
import { StatusBadge } from '@/components/shared/status-badge'
import { RvmFormDialog } from '@/components/rvms/rvm-form-dialog'
import { DeleteDialog } from '@/components/rvms/delete-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowUpDown, RefreshCw, Lock, MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Rvm, RvmRequest, RvmStatus } from '@/lib/types'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  AVAILABLE: 'success',
  BUSY: 'warning',
  BROKEN: 'danger',
  UNKNOWN: 'neutral',
  REMOVED: 'danger',
}

const ALL_STATUSES: RvmStatus[] = ['AVAILABLE', 'BUSY', 'BROKEN', 'UNKNOWN', 'REMOVED']
const PAGE_SIZE = 20

type SortKey = 'id' | 'name' | 'city' | 'status' | 'confidenceScore' | 'statusUpdatedAt'
type SortDir = 'asc' | 'desc'

function SortIcon({ column, active, dir }: { column: string; active: string; dir: SortDir }) {
  if (column !== active) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300" />
  return dir === 'asc'
    ? <ArrowUp className="ml-1 h-3 w-3 text-green-600" />
    : <ArrowDown className="ml-1 h-3 w-3 text-green-600" />
}

export default function RvmsPage() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<RvmStatus | ''>('')
  const [sortBy, setSortBy] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  const { data: allRvms = [], isLoading } = useAllRvms()

  // Client-side filter + sort + paginate
  const filtered = useMemo(() => {
    const lowerSearch = searchText.toLowerCase()
    return allRvms.filter((rvm) => {
      if (searchText && !rvm.name.toLowerCase().includes(lowerSearch)
          && !rvm.city.toLowerCase().includes(lowerSearch)) return false
      if (statusFilter && rvm.status !== statusFilter) return false
      return true
    })
  }, [allRvms, searchText, statusFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'id': cmp = a.id - b.id; break
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'city': cmp = (a.city ?? '').localeCompare(b.city ?? ''); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'confidenceScore': cmp = (a.confidenceScore ?? 0) - (b.confidenceScore ?? 0); break
        case 'statusUpdatedAt': cmp = (a.statusUpdatedAt ?? '').localeCompare(b.statusUpdatedAt ?? ''); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filtered, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Rvm | null>(null)
  const createMutation = useCreateRvm()
  const updateMutation = useUpdateRvm()

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (rvm: Rvm) => { setEditTarget(rvm); setFormOpen(true) }

  const handleFormSubmit = (formData: RvmRequest) => {
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, ...formData },
        {
          onSuccess: () => { toast.success('RVM updated'); setFormOpen(false) },
          onError: () => toast.error('Failed to update RVM'),
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { toast.success('RVM created'); setFormOpen(false) },
        onError: () => toast.error('Failed to create RVM'),
      })
    }
  }

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Rvm | null>(null)
  const deleteMutation = useDeleteRvm()
  const syncMutation = useSyncRvms()
  const statusMutation = useUpdateRvmStatus()

  const handleStatusChange = (rvm: Rvm, status: RvmStatus, locked?: boolean) => {
    statusMutation.mutate(
      { id: rvm.id, status, locked },
      {
        onSuccess: () => toast.success(`${rvm.name} set to ${status}${locked ? ' (locked)' : ''}`),
        onError: () => toast.error('Failed to update status'),
      }
    )
  }

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        const parts = [`Synced ${result.upserted}/${result.fetched} RVMs`]
        if (result.newCount > 0) parts.push(`${result.newCount} new: ${result.newRvmNames.join(', ')}`)
        if (result.removedCount > 0) parts.push(`${result.removedCount} removed: ${result.removedExternalIds.join(', ')}`)
        toast.success(parts.join('\n'))
      },
      onError: () => toast.error('Failed to sync from Re-turn API'),
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success('RVM deleted'); setDeleteTarget(null) },
      onError: () => toast.error('Failed to delete RVM'),
    })
  }

  const SortableHead = ({ label, column }: { label: string; column: SortKey }) => (
    <TableHead
      className="text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
      onClick={() => toggleSort(column)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon column={column} active={sortBy} dir={sortDir} />
      </span>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          RVMs{' '}
          <span className="text-base font-normal text-gray-400">
            ({filtered.length.toLocaleString()})
          </span>
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="cursor-pointer"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Re-turn'}
          </Button>
          <Button onClick={openCreate} className="cursor-pointer bg-green-500 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" /> Add RVM
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search name or city..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            className={`cursor-pointer ${statusFilter === '' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => { setStatusFilter(''); setPage(1) }}
          >
            All
          </Button>
          {ALL_STATUSES.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              className={`cursor-pointer ${statusFilter === s ? 'bg-green-500 hover:bg-green-600' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1) }}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <SortableHead label="ID" column="id" />
              <SortableHead label="Name" column="name" />
              <SortableHead label="City" column="city" />
              <SortableHead label="Status" column="status" />
              <SortableHead label="Confidence" column="confidenceScore" />
              <SortableHead label="Last Updated" column="statusUpdatedAt" />
              <TableHead className="text-xs font-medium text-gray-500 uppercase w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-gray-400">
                  No RVMs found
                </TableCell>
              </TableRow>
            ) : (
              paged.map((rvm) => (
                <TableRow key={rvm.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="text-sm text-gray-500 tabular-nums">{rvm.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{rvm.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{rvm.city}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <StatusBadge label={rvm.status} variant={STATUS_VARIANT[rvm.status] ?? 'neutral'} />
                      {rvm.adminLocked && <Lock className="h-3 w-3 text-gray-400" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {rvm.confidenceScore !== null ? `${Math.round(rvm.confidenceScore)}%` : '\u2014'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {rvm.statusUpdatedAt ? new Date(rvm.statusUpdatedAt).toLocaleDateString() : '\u2014'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => openEdit(rvm)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setDeleteTarget(rvm)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(['AVAILABLE', 'BUSY', 'BROKEN', 'UNKNOWN'] as RvmStatus[]).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              className="cursor-pointer"
                              disabled={rvm.status === s}
                              onClick={() => handleStatusChange(rvm, s)}
                            >
                              Set {s.charAt(0) + s.slice(1).toLowerCase()}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {rvm.adminLocked ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600"
                              onClick={() => handleStatusChange(rvm, 'UNKNOWN', false)}
                            >
                              Unlock (reset to Unknown)
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer text-amber-600"
                              onClick={() => handleStatusChange(rvm, rvm.status, true)}
                            >
                              Lock current status
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            disabled={rvm.status === 'REMOVED'}
                            onClick={() => handleStatusChange(rvm, 'REMOVED')}
                          >
                            Mark as Removed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-500">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="cursor-pointer"
                onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer"
                onClick={() => setPage((p) => p + 1)} disabled={safePage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <RvmFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        rvm={editTarget}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        rvmName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
