import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Device } from '../types';

interface AppState {
  deviceId: string | null;
  device: Device | null;
  hasConsented: boolean;
  hasSeenOnboarding: boolean;
  setDeviceId: (id: string) => void;
  setDevice: (device: Device | null) => void;
  setHasConsented: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      deviceId: null,
      device: null,
      hasConsented: false,
      hasSeenOnboarding: false,
      setDeviceId: (id: string) => set({ deviceId: id }),
      setDevice: (device: Device | null) => set({ device }),
      setHasConsented: (value: boolean) => set({ hasConsented: value }),
      setHasSeenOnboarding: (value: boolean) => set({ hasSeenOnboarding: value }),
    }),
    {
      name: 'eco-return-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
