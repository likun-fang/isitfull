import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { api } from '../api';
import { secureStorage } from '../secureStorage';

jest.mock('../secureStorage', () => ({
  secureStorage: {
    getTokens: jest.fn(),
    saveTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const mockAuthStore = {
  accessToken: null as string | null,
  setAccessToken: jest.fn((token: string) => {
    mockAuthStore.accessToken = token;
  }),
  logout: jest.fn(),
};

jest.mock('../../stores', () => ({
  useAuthStore: { getState: () => mockAuthStore },
}));

const FRESH_ACCESS_TOKEN = 'fresh-access-token';

// Stands in for the network: only a request with the fresh access token gets through.
function fakeBackend(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  if (config.headers.Authorization === `Bearer ${FRESH_ACCESS_TOKEN}`) {
    return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
  }
  return Promise.reject(unauthorized(config));
}

function unauthorized(config?: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    data: { success: false },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config: config as InternalAxiosRequestConfig,
  });
}

// The refresh answers after a short delay, so the three 401s arrive while it is in flight.
function later<T>(settle: (resolve: (value: T) => void, reject: (reason: unknown) => void) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => setTimeout(() => settle(resolve, reject), 20));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthStore.accessToken = 'expired-access-token';
  api.defaults.adapter = fakeBackend;
  jest.mocked(secureStorage.getTokens).mockResolvedValue({
    accessToken: 'expired-access-token',
    refreshToken: 'refresh-token-1',
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('api 401 handling', () => {
  it('sends one refresh for concurrent 401s and retries every request with the new token', async () => {
    const refresh = jest.spyOn(axios, 'post').mockImplementation(() =>
      later((resolve) =>
        resolve({
          data: { success: true, data: { accessToken: FRESH_ACCESS_TOKEN, refreshToken: 'refresh-token-2' } },
        } as AxiosResponse)
      )
    );

    const responses = await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    expect(secureStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: FRESH_ACCESS_TOKEN,
      refreshToken: 'refresh-token-2',
    });
    expect(secureStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('clears the tokens once when the shared refresh is rejected', async () => {
    const refresh = jest.spyOn(axios, 'post').mockImplementation(() =>
      later((_resolve, reject) => reject(unauthorized()))
    );

    const results = await Promise.allSettled([api.get('/a'), api.get('/b'), api.get('/c')]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected', 'rejected']);
    expect(secureStorage.clearTokens).toHaveBeenCalledTimes(1);
    expect(mockAuthStore.logout).toHaveBeenCalledTimes(1);
  });
});
