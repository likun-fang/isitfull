import { api } from './api';
import { ApiResponse } from '../types';

export interface AppConfig {
  minVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export const appConfigService = {
  getConfig: async (): Promise<AppConfig> => {
    const response = await api.get<ApiResponse<AppConfig>>('/app-config');
    if (!response.data.data) {
      throw new Error('Failed to fetch app config');
    }
    return response.data.data;
  },
};
