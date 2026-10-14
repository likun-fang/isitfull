import { useMemo } from 'react';
import { Rvm } from '../types';
import { useLocationStore } from '../stores/useLocationStore';
import { haversineDistance } from '../utils/distance';

const MAX_DISTANCE_METERS = 2000;

interface NearestResult {
  rvm: Rvm;
  distanceMeters: number;
}

export function useNearestAvailableRvm(rvms: Rvm[]): NearestResult | null {
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);

  return useMemo(() => {
    if (latitude == null || longitude == null) return null;

    const userLocation = { latitude, longitude };
    let best: NearestResult | null = null;

    for (const rvm of rvms) {
      if (rvm.status !== 'AVAILABLE') continue;
      if (rvm.lat == null || rvm.lng == null) continue;

      const dist = haversineDistance(userLocation, {
        latitude: rvm.lat,
        longitude: rvm.lng,
      });

      if (dist > MAX_DISTANCE_METERS) continue;
      if (!best || dist < best.distanceMeters) {
        best = { rvm, distanceMeters: dist };
      }
    }

    return best;
  }, [rvms, latitude, longitude]);
}
