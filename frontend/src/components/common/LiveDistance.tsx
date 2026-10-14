import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useLocationStore } from '../../stores/useLocationStore';
import { haversineDistance, formatDistance, formatDistanceShort } from '../../utils/distance';

interface Props {
  targetLat: number;
  targetLng: number;
  /** 'long' = "1.2km away", 'short' = "1.2km" */
  format?: 'long' | 'short';
  style?: TextStyle;
  fallback?: string;
}

export function LiveDistance({
  targetLat,
  targetLng,
  format = 'long',
  style,
  fallback = 'Distance unknown',
}: Props) {
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);

  if (latitude == null || longitude == null) {
    return <Text style={style}>{fallback}</Text>;
  }

  const meters = haversineDistance(
    { latitude, longitude },
    { latitude: targetLat, longitude: targetLng }
  );

  const text = format === 'short'
    ? formatDistanceShort(meters)
    : formatDistance(meters);

  return <Text style={style}>{text}</Text>;
}
