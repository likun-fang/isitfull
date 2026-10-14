import { useQuery } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, DashboardStats } from '../types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStats>>(
        '/api/admin/dashboard/stats'
      )
      return data.data!
    },
    refetchInterval: 60_000,
  })
}
