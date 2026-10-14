import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Rvm } from '../../types';
import { getStatusColor } from '../../utils/statusColor';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  rvm: Rvm;
  onPress?: () => void;
}

export const RvmMarker = React.memo(function RvmMarker({ rvm, onPress }: Props) {
  const color = getStatusColor(rvm.status, rvm.queueLength);
  const { isDark } = useAppTheme();
  const prevColorRef = useRef(color);
  const [tracked, setTracked] = useState(false);

  // Re-enable tracking when color changes so Android re-captures the bitmap
  useEffect(() => {
    if (Platform.OS === 'android' && prevColorRef.current !== color) {
      prevColorRef.current = color;
      setTracked(true);
    }
  }, [color]);

  // Disable tracking after bitmap is captured
  useEffect(() => {
    if (tracked) {
      const timer = setTimeout(() => setTracked(false), 500);
      return () => clearTimeout(timer);
    }
  }, [tracked]);

  return (
    <Marker
      coordinate={{ latitude: rvm.lat, longitude: rvm.lng }}
      onPress={onPress}
      tracksViewChanges={tracked}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: color },
          isDark && styles.markerDark,
        ]}
      >
        <View style={[styles.innerCircle, isDark && styles.innerCircleDark]} />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerDark: {
    borderColor: 'rgba(0,0,0,0.4)',
    shadowOpacity: 0.5,
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  innerCircleDark: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
