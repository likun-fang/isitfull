import { AxiosError } from 'axios';
import { api } from './api';
import { ApiResponse, ReportRequest, ReportResponse } from '../types';

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const reportService = {
  create: async (rvmId: number, request: ReportRequest): Promise<ReportResponse> => {
    try {
      const response = await api.post<ApiResponse<ReportResponse>>(
        `/rvms/${rvmId}/reports`,
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit report');
      }

      return response.data.data!;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || 'Failed to submit report');
      }
      throw error;
    }
  },
};
