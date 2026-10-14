import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, IssueReport, ResolveIssueRequest } from '../types'

export function useIssues(status: string, page: number, size: number) {
  return useQuery({
    queryKey: ['issues', status, page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<IssueReport[]>>(
        `/api/admin/issues?${params}`
      )
      return data
    },
  })
}

export function useIssue(id: number | null) {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<IssueReport>>(
        `/api/admin/issues/${id}`
      )
      return data.data!
    },
    enabled: id !== null,
  })
}

export function useResolveIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: ResolveIssueRequest & { id: number }) => {
      const { data } = await api.put<ApiResponse<string>>(
        `/api/admin/issues/${id}/resolve`,
        body
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  })
}
