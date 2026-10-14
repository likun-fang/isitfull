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

// The backend rotates the refresh token on every refresh, so two refreshes with the same token
// make the second one fail. Requests that get a 401 at the same time therefore share one refresh.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokens = await secureStorage.getTokens();
  if (!tokens?.refreshToken) {
    return null;
  }
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });
    if (!response.data.success) {
      return null;
    }
    const newTokens = response.data.data;
    await secureStorage.saveTokens({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
    useAuthStore.getState().setAccessToken(newTokens.accessToken);
    return newTokens.accessToken;
  } catch {
    useAuthStore.getState().logout();
    await secureStorage.clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
      }
      const accessToken = await refreshInFlight;
      if (accessToken) {
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);
