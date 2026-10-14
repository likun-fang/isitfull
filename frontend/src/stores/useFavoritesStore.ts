import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  // Guest mode: stored locally
  localFavorites: number[];
  // Authenticated mode: cached from server
  serverFavorites: number[];
  // Loading state
  isLoading: boolean;

  // Actions for local favorites (guest mode)
  addLocalFavorite: (rvmId: number) => void;
  removeLocalFavorite: (rvmId: number) => void;
  clearLocalFavorites: () => void;

  // Actions for server favorites (authenticated mode)
  setServerFavorites: (ids: number[]) => void;
  addServerFavorite: (rvmId: number) => void;
  removeServerFavorite: (rvmId: number) => void;
  clearServerFavorites: () => void;

  // Loading state
  setLoading: (loading: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      localFavorites: [],
      serverFavorites: [],
      isLoading: false,

      addLocalFavorite: (rvmId) =>
        set((state) => ({
          localFavorites: state.localFavorites.includes(rvmId)
            ? state.localFavorites
            : [...state.localFavorites, rvmId],
        })),

      removeLocalFavorite: (rvmId) =>
        set((state) => ({
          localFavorites: state.localFavorites.filter((id) => id !== rvmId),
        })),

      clearLocalFavorites: () => set({ localFavorites: [] }),

      setServerFavorites: (ids) => set({ serverFavorites: ids }),

      addServerFavorite: (rvmId) =>
        set((state) => ({
          serverFavorites: state.serverFavorites.includes(rvmId)
            ? state.serverFavorites
            : [...state.serverFavorites, rvmId],
        })),

      removeServerFavorite: (rvmId) =>
        set((state) => ({
          serverFavorites: state.serverFavorites.filter((id) => id !== rvmId),
        })),

      clearServerFavorites: () => set({ serverFavorites: [] }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist localFavorites (serverFavorites are fetched from API)
      partialize: (state) => ({ localFavorites: state.localFavorites }),
    }
  )
);
