import { api } from './api';
import { ApiResponse } from '../types';

export interface FavoriteMergeResult {
  added: number;
  total: number;
  favorites: number[];
}

export const favoriteService = {
  /**
   * Get all favorites for the current user.
   */
  async getFavorites(): Promise<number[]> {
    const response = await api.get<ApiResponse<number[]>>('/favorites');
    return response.data.data || [];
  },

  /**
   * Add a single RVM to favorites.
   */
  async addFavorite(rvmId: number): Promise<void> {
    await api.post(`/favorites/${rvmId}`);
  },

  /**
   * Remove a single RVM from favorites.
   */
  async removeFavorite(rvmId: number): Promise<void> {
    await api.delete(`/favorites/${rvmId}`);
  },

  /**
   * Batch merge favorites (for login sync).
   */
  async mergeFavorites(rvmIds: number[]): Promise<FavoriteMergeResult> {
    const response = await api.post<ApiResponse<FavoriteMergeResult>>(
      '/favorites/batch',
      { rvmIds }
    );
    return response.data.data!;
  },
};
