import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'eco_return_device_id';
const ACCESS_TOKEN_KEY = 'eco_return_access_token';
const REFRESH_TOKEN_KEY = 'eco_return_refresh_token';
const FALLBACK_DEVICE_KEY = '@device_id_fallback';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const isSecureStoreAvailable = Platform.OS !== 'web';

// Generate UUID using expo-crypto (React Native compatible)
function generateUUID(): string {
  return Crypto.randomUUID();
}

export const secureStorage = {
  async getOrCreateDeviceId(): Promise<string> {
    try {
      if (isSecureStoreAvailable) {
        const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (existingId) {
          return existingId;
        }

        const newDeviceId = generateUUID();
        await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);
        return newDeviceId;
      }
    } catch (error) {
      console.warn('SecureStore failed, using AsyncStorage fallback:', error);
    }

    let fallbackId = await AsyncStorage.getItem(FALLBACK_DEVICE_KEY);
    if (!fallbackId) {
      fallbackId = generateUUID();
      await AsyncStorage.setItem(FALLBACK_DEVICE_KEY, fallbackId);
    }
    return fallbackId;
  },

  async saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
      } else {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  },

  async getTokens(): Promise<StoredTokens | null> {
    try {
      let accessToken: string | null;
      let refreshToken: string | null;

      if (isSecureStoreAvailable) {
        accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      } else {
        accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      }

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } else {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },
};
