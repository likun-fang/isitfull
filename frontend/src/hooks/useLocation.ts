import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../stores/useAppStore';
import { useLocationStore } from '../stores/useLocationStore';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  /** First-fix location for initialRegion — stable after first resolve */
  location: LocationCoords | null;
  error: string | null;
  loading: boolean;
  /** Get current location imperatively (for event handlers) */
  getLocation: () => LocationCoords | null;
}

export function useLocation(): UseLocationResult {
  const [firstFix, setFirstFix] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasConsented = useAppStore((state) => state.hasConsented);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const setCoordinates = useLocationStore((s) => s.setCoordinates);

  const getLocation = useCallback((): LocationCoords | null => {
    const { latitude, longitude } = useLocationStore.getState();
    if (latitude == null || longitude == null) return null;
    return { latitude, longitude };
  }, []);

  useEffect(() => {
    if (!hasConsented) {
      setError('Privacy consent required');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let resolved = false;

    const resolve = (coords: LocationCoords) => {
      if (!isMounted) return;
      // Always update the store (for LiveDistance)
      setCoordinates(coords.latitude, coords.longitude);
      // Only set firstFix once (stable reference for initialRegion)
      if (!resolved) {
        resolved = true;
        setFirstFix(coords);
        setLoading(false);
      }
    };

    // Safety net: release loading after 5s even without a fix
    const timeout = setTimeout(() => {
      if (isMounted && !resolved) {
        setLoading(false);
      }
    }, 5000);

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setError('Location permission denied');
            setLoading(false);
          }
          return;
        }

        // Try cached location first (instant on both platforms)
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          resolve({
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          });
        }

        // Then get a fresh position (can be slow on Android)
        try {
          const initial = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted) {
            resolve({
              latitude: initial.coords.latitude,
              longitude: initial.coords.longitude,
            });
          }
        } catch {
          // Timeout or watch will handle it
        }

        // Start continuous watch — updates as user moves
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (loc) => {
            if (isMounted) {
              resolve({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          }
        );

        subscriptionRef.current = sub;
      } catch {
        if (isMounted) {
          setError('Failed to get location');
          setLoading(false);
        }
      }
    };

    startWatching();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [hasConsented, setCoordinates]);

  return { location: firstFix, error, loading, getLocation };
}
