import { useQuery, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import { rvmService } from '../services/rvmService';
import { DEFAULT_RADIUS } from '../constants/config';
import { Rvm } from '../types';

interface Location {
  latitude: number;
  longitude: number;
}

export function useNearbyRvms(
  location: Location | null,
  radius: number = DEFAULT_RADIUS,
  limit?: number
): UseQueryResult<Rvm[], Error> {
  return useQuery({
    queryKey: ['rvms', location?.latitude, location?.longitude, radius, limit],
    queryFn: () => rvmService.getNearby(location!.latitude, location!.longitude, radius, limit),
    enabled: !!location,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
