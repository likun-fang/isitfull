import { api } from './api';
import { secureStorage } from './secureStorage';
import { AuthResponse, User, ApiResponse } from '../types';

export const authService = {
  async guestLogin(): Promise<AuthResponse> {
    const deviceId = await secureStorage.getOrCreateDeviceId();
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/guest', {
      deviceId,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Guest login failed');
    }

    const authResponse = response.data.data;
    await secureStorage.saveTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });

    return authResponse;
  },

  async firebaseLogin(firebaseToken: string): Promise<AuthResponse> {
    const deviceId = await secureStorage.getOrCreateDeviceId();
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/firebase', {
      firebaseToken,
      currentDeviceId: deviceId,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }

    const authResponse = response.data.data;
    await secureStorage.saveTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });

    return authResponse;
  },

  async refresh(): Promise<AuthResponse | null> {
    const tokens = await secureStorage.getTokens();
    if (!tokens?.refreshToken) {
      return null;
    }

    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      if (!response.data.success || !response.data.data) {
        await secureStorage.clearTokens();
        return null;
      }

      const authResponse = response.data.data;
      await secureStorage.saveTokens({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      });

      return authResponse;
    } catch {
      await secureStorage.clearTokens();
      return null;
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/users/me');
      return response.data.data || null;
    } catch {
      return null;
    }
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me');
    await secureStorage.clearTokens();
  },

  async logout(): Promise<void> {
    await secureStorage.clearTokens();
  },
};
