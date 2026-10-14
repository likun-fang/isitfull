export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const DEFAULT_RADIUS = 5000;
export const MAX_RADIUS = 50000;
export const GEOFENCE_RADIUS = 150;

export const MAP_INITIAL_REGION = {
  latitude: 53.3498,
  longitude: -6.2603,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};
