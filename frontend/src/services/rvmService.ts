import { api } from './api';
import { ApiResponse, Rvm, IssueReason } from '../types';

export const rvmService = {
  getNearby: async (lat: number, lng: number, radius?: number, limit?: number): Promise<Rvm[]> => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (radius) params.append('radius', radius.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await api.get<ApiResponse<Rvm[]>>(`/rvms/nearby?${params}`);
    return response.data.data || [];
  },

  getById: async (id: number, lat?: number, lng?: number): Promise<Rvm | null> => {
    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
    }
    const query = params.toString();
    const response = await api.get<ApiResponse<Rvm>>(`/rvms/${id}${query ? `?${query}` : ''}`);
    return response.data.data || null;
  },

  getByIds: async (ids: number[], lat?: number, lng?: number): Promise<Rvm[]> => {
    const params = new URLSearchParams({ ids: ids.join(',') });
    if (lat != null && lng != null) {
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
    }
    const response = await api.get<ApiResponse<Rvm[]>>(`/rvms/batch?${params}`);
    return response.data.data || [];
  },

  reportIssue: async (rvmId: number, reason: IssueReason): Promise<string> => {
    const response = await api.post<ApiResponse<string>>(`/rvms/${rvmId}/issues`, { reason });
    return response.data.data || 'Report submitted.';
  },
};
