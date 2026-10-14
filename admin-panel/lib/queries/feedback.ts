import { useQuery } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, FeedbackItem } from '../types'

export function useFeedback(type: string, page: number, size: number) {
  return useQuery({
    queryKey: ['feedback', type, page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<FeedbackItem[]>>(
        `/api/admin/feedback?${params}`
      )
      return data
    },
  })
}
