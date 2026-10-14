import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/lib/types'

interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await api.post<ApiResponse<string>>(
        '/api/admin/auth/change-password',
        payload
      )
      if (!data.success) {
        throw new Error(data.message || 'Failed to change password')
      }
      return data.data
    },
  })
}
