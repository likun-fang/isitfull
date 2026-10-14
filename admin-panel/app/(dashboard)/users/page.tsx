'use client'

import { useState } from 'react'
import { useUsers, useBanUser, useUnbanUser, useAdjustKarma } from '@/lib/queries/users'
import { StatusBadge } from '@/components/shared/status-badge'
import { BanDialog } from '@/components/users/ban-dialog'
import { KarmaDialog } from '@/components/users/karma-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Ban, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/lib/types'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const size = 20

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const handleSearch = (value: string) => {
    setSearch(value)
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
    setTimer(t)
  }

  const { data, isLoading } = useUsers(debouncedSearch, page, size)
  const users = data?.data ?? []
  const meta = data?.meta

  const [banTarget, setBanTarget] = useState<User | null>(null)
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()

  const handleBanConfirm = () => {
    if (!banTarget) return
    const isBanned = !!banTarget.deletedAt
    const mutation = isBanned ? unbanMutation : banMutation
    mutation.mutate(banTarget.id, {
      onSuccess: () => {
        toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`)
        setBanTarget(null)
      },
      onError: () => toast.error('Action failed'),
    })
  }

  const [karmaTarget, setKarmaTarget] = useState<User | null>(null)
  const karmaMutation = useAdjustKarma()

  const handleKarmaConfirm = (points: number, reason: string) => {
    if (!karmaTarget) return
    karmaMutation.mutate(
      { userId: karmaTarget.id, points, reason },
      {
        onSuccess: () => {
          toast.success('Karma adjusted successfully')
          setKarmaTarget(null)
        },
        onError: () => toast.error('Failed to adjust karma'),
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Users {meta?.total !== undefined && (
            <span className="text-base font-normal text-gray-400">
              ({meta.total.toLocaleString()})
            </span>
          )}
        </h1>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Email</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Karma</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Reports</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-gray-400">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isBanned = !!user.deletedAt
                return (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">
                      {user.displayName || 'Anonymous'}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {user.email || '\u2014'}
                    </TableCell>
                    <TableCell className="font-medium">{user.karmaPoints}</TableCell>
                    <TableCell>{user.reportCount}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={isBanned ? 'Banned' : 'Active'}
                        variant={isBanned ? 'danger' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setBanTarget(user)}>
                            {isBanned ? (
                              <><ShieldCheck className="mr-2 h-4 w-4" /> Unban</>
                            ) : (
                              <><Ban className="mr-2 h-4 w-4 text-red-500" /> Ban</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setKarmaTarget(user)}>
                            <Star className="mr-2 h-4 w-4" /> Adjust Karma
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
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

      <BanDialog
        open={!!banTarget}
        onOpenChange={(open) => { if (!open) setBanTarget(null) }}
        userName={banTarget?.displayName || 'Anonymous'}
        isBanned={!!banTarget?.deletedAt}
        isPending={banMutation.isPending || unbanMutation.isPending}
        onConfirm={handleBanConfirm}
      />

      <KarmaDialog
        open={!!karmaTarget}
        onOpenChange={(open) => { if (!open) setKarmaTarget(null) }}
        userName={karmaTarget?.displayName || 'Anonymous'}
        currentKarma={karmaTarget?.karmaPoints ?? 0}
        isPending={karmaMutation.isPending}
        onConfirm={handleKarmaConfirm}
      />
    </div>
  )
}
