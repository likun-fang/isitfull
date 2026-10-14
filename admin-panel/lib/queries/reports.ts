import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, StatusReport } from '../types'

export function useReports(status: string, rvmId: string, page: number, size: number) {
  return useQuery({
    queryKey: ['reports', status, rvmId, page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (rvmId) params.set('rvmId', rvmId)
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<StatusReport[]>>(
        `/api/admin/reports?${params}`
      )
      return data
    },
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<string>>(
        `/api/admin/reports/${id}`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  })
}
