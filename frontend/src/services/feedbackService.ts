import { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { api } from './api';
import { ApiResponse } from '../types';

type FeedbackType = 'BUG' | 'FEATURE';

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ScreenshotAsset {
  uri: string;
  fileName: string;
  mimeType: string;
}

export const feedbackService = {
  submit: async (
    type: FeedbackType,
    message: string,
    screenshot?: ScreenshotAsset | null
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('message', message);

      if (screenshot) {
        const file = {
          uri: Platform.OS === 'android'
            ? screenshot.uri
            : screenshot.uri.replace('file://', ''),
          name: screenshot.fileName,
          type: screenshot.mimeType,
        } as unknown as Blob;
        formData.append('screenshot', file);
      }

      const response = await api.post<ApiResponse<string>>(
        '/feedback',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit feedback');
      }

      return response.data.data!;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      throw error;
    }
  },
};
