import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useAuthStore, useIsGuest } from '../stores';
import { favoriteService } from '../services/favoriteService';

interface UseFavoritesReturn {
  favorites: number[];
  isLoading: boolean;
  isFavorite: (rvmId: number) => boolean;
  toggleFavorite: (rvmId: number) => Promise<void>;
  addFavorite: (rvmId: number) => Promise<void>;
  removeFavorite: (rvmId: number) => Promise<void>;
  syncFavoritesOnLogin: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const queryClient = useQueryClient();
  const isGuest = useIsGuest();
  const user = useAuthStore((state) => state.user);

  const {
    localFavorites,
    serverFavorites,
    isLoading: storeLoading,
    addLocalFavorite,
    removeLocalFavorite,
    clearLocalFavorites,
    setServerFavorites,
    addServerFavorite,
    removeServerFavorite,
    setLoading,
  } = useFavoritesStore();

  // Fetch server favorites for authenticated users
  const { data: fetchedFavorites, isLoading: queryLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: favoriteService.getFavorites,
    enabled: !isGuest && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync fetched favorites to store
  useEffect(() => {
    if (fetchedFavorites && !isGuest) {
      setServerFavorites(fetchedFavorites);
    }
  }, [fetchedFavorites, isGuest, setServerFavorites]);

  // Add favorite mutation
  const addMutation = useMutation({
    mutationFn: favoriteService.addFavorite,
    onMutate: async (rvmId) => {
      // Optimistic update
      addServerFavorite(rvmId);
    },
    onError: (_, rvmId) => {
      // Rollback on error
      removeServerFavorite(rvmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Remove favorite mutation
  const removeMutation = useMutation({
    mutationFn: favoriteService.removeFavorite,
    onMutate: async (rvmId) => {
      // Optimistic update
      removeServerFavorite(rvmId);
    },
    onError: (_, rvmId) => {
      // Rollback on error
      addServerFavorite(rvmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Get current favorites based on auth state
  const favorites = isGuest ? localFavorites : serverFavorites;
  const isLoading = storeLoading || queryLoading || addMutation.isPending || removeMutation.isPending;

  const isFavorite = useCallback(
    (rvmId: number) => favorites.includes(rvmId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (rvmId: number) => {
      if (isGuest) {
        addLocalFavorite(rvmId);
      } else {
        await addMutation.mutateAsync(rvmId);
      }
    },
    [isGuest, addLocalFavorite, addMutation]
  );

  const removeFavorite = useCallback(
    async (rvmId: number) => {
      if (isGuest) {
        removeLocalFavorite(rvmId);
      } else {
        await removeMutation.mutateAsync(rvmId);
      }
    },
    [isGuest, removeLocalFavorite, removeMutation]
  );

  const toggleFavorite = useCallback(
    async (rvmId: number) => {
      if (isFavorite(rvmId)) {
        await removeFavorite(rvmId);
      } else {
        await addFavorite(rvmId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  // Sync local favorites to server on login
  const syncFavoritesOnLogin = useCallback(async () => {
    if (localFavorites.length === 0) {
      // No local favorites to sync, just fetch server favorites
      const serverFavs = await favoriteService.getFavorites();
      setServerFavorites(serverFavs);
      return;
    }

    setLoading(true);
    try {
      const result = await favoriteService.mergeFavorites(localFavorites);
      setServerFavorites(result.favorites);
      clearLocalFavorites();
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } finally {
      setLoading(false);
    }
  }, [localFavorites, setServerFavorites, clearLocalFavorites, setLoading, queryClient]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    syncFavoritesOnLogin,
  };
}
