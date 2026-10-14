import { useQuery } from '@tanstack/react-query';
import { rvmService } from '../services/rvmService';
import { Rvm } from '../types';
import { useLocationStore } from '../stores/useLocationStore';

export function useRvmDetail(rvmId: number | null) {
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);

  return useQuery({
    queryKey: ['rvm', rvmId],
    queryFn: () =>
      rvmService.getById(
        rvmId!,
        latitude ?? undefined,
        longitude ?? undefined
      ),
    enabled: rvmId !== null,
    staleTime: 30 * 1000,
  });
}
