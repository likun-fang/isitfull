import { useQuery } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, AuditLog } from '../types'

export function useAuditLogs(page: number, size: number) {
  return useQuery({
    queryKey: ['audit', page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<AuditLog[]>>(
        `/api/admin/audit?${params}`
      )
      return data
    },
  })
}
