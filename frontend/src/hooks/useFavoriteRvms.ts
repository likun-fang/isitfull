import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { rvmService } from '../services/rvmService';
import { Rvm } from '../types';
import { useLocationStore } from '../stores/useLocationStore';

export function useFavoriteRvms(
  favoriteIds: number[]
): UseQueryResult<Rvm[], Error> {
  const sorted = [...favoriteIds].sort();
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);

  return useQuery({
    queryKey: ['rvms', 'favorites', ...sorted],
    queryFn: () => rvmService.getByIds(
      sorted,
      latitude ?? undefined,
      longitude ?? undefined
    ),
    enabled: sorted.length > 0,
    staleTime: 0,
  });
}
