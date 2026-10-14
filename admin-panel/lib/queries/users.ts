import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import type { ApiResponse, User, AdjustKarmaRequest } from '../types'

export function useUsers(search: string, page: number, size: number) {
  return useQuery({
    queryKey: ['users', search, page, size],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('size', String(size))
      const { data } = await api.get<ApiResponse<User[]>>(
        `/api/admin/users?${params}`
      )
      return data
    },
  })
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>(
        `/api/admin/users/${id}`
      )
      return data.data!
    },
    enabled: id !== null,
  })
}

export function useBanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put<ApiResponse<string>>(
        `/api/admin/users/${id}/ban`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUnbanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put<ApiResponse<string>>(
        `/api/admin/users/${id}/unban`
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useAdjustKarma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      ...body
    }: AdjustKarmaRequest & { userId: number }) => {
      const { data } = await api.post<ApiResponse<string>>(
        `/api/admin/users/${userId}/karma`,
        body
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
