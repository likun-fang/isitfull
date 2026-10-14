import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuthStore } from '../stores';
import { secureStorage } from './secureStorage';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const tokens = await secureStorage.getTokens();
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          if (response.data.success) {
            const newTokens = response.data.data;
            await secureStorage.saveTokens({
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
            });
            useAuthStore.getState().setAccessToken(newTokens.accessToken);

            error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return axios(error.config);
          }
        } catch {
          useAuthStore.getState().logout();
          await secureStorage.clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);
