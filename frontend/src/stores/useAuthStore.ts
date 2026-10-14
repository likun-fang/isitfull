import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setHydrated: (isHydrated) => set({ isHydrated }),

  logout: () => set({ user: null, accessToken: null }),
}));

export const useIsGuest = () => {
  const user = useAuthStore((state) => state.user);
  return !user || user.provider === 'GUEST';
};
