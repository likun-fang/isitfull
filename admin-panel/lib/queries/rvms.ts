import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, Rvm, RvmRequest, RvmStatusRequest, RvmSyncResult } from '../types'

export function useRvms(city: string, page: number, size: number) {
  return useQuery({
    queryKey: ['rvms', city, page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<Rvm[]>>(
        `/api/admin/rvms?${params}`
      )
      return data
    },
  })
}

export function useAllRvms() {
  return useQuery({
    queryKey: ['rvms', 'all'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Rvm[]>>(
        '/api/admin/rvms?page=1&size=5000'
      )
      return data.data ?? []
    },
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
  })
}

export function useRvm(id: number | null) {
  return useQuery({
    queryKey: ['rvms', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Rvm>>(
        `/api/admin/rvms/${id}`
      )
      return data.data!
    },
    enabled: id !== null,
  })
}

export function useCreateRvm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: RvmRequest) => {
      const { data } = await api.post<ApiResponse<Rvm>>(
        '/api/admin/rvms',
        body
      )
      return data.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}

export function useUpdateRvm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: RvmRequest & { id: number }) => {
      const { data } = await api.put<ApiResponse<Rvm>>(
        `/api/admin/rvms/${id}`,
        body
      )
      return data.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}

export function useDeleteRvm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<string>>(
        `/api/admin/rvms/${id}`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}

export function useBatchImportRvms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: RvmRequest[]) => {
      const { data } = await api.post<ApiResponse<string>>(
        '/api/admin/rvms/batch',
        body
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}

export function useSyncRvms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<RvmSyncResult>>(
        '/api/admin/rvms/sync'
      )
      return data.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}

export function useUpdateRvmStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: RvmStatusRequest & { id: number }) => {
      const { data } = await api.patch<ApiResponse<Rvm>>(
        `/api/admin/rvms/${id}/status`,
        body
      )
      return data.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rvms'] }),
  })
}
