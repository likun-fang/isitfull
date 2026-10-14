import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Platform, InteractionManager } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Rvm } from '../../types';
import { RvmMarker } from './RvmMarker';
import { MAP_INITIAL_REGION } from '../../constants/config';
import { useAppTheme } from '../../theme/ThemeContext';
import { mapDarkStyle } from './mapDarkStyle';

const ANDROID_BATCH_SIZE = 100;
const ANDROID_BATCH_DELAY = 200;

interface Props {
  rvms: Rvm[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress?: (rvm: Rvm) => void;
  onMapPress?: () => void;
  onRegionChange?: (region: Region) => void;
}

export interface RvmMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
}

export const RvmMap = forwardRef<RvmMapRef, Props>(
  ({ rvms, userLocation, onMarkerPress, onMapPress, onRegionChange }, ref) => {
    const mapRef = useRef<MapView>(null);
    const { isDark } = useAppTheme();
    const [bufferedRvms, setBufferedRvms] = useState<Rvm[]>(rvms);
    const [visibleCount, setVisibleCount] = useState(
      Platform.OS === 'android' ? ANDROID_BATCH_SIZE : Infinity
    );

    // Defer marker updates until animations complete
    useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setBufferedRvms(rvms);
        if (Platform.OS === 'android') {
          setVisibleCount(ANDROID_BATCH_SIZE);
        }
      });
      return () => task.cancel();
    }, [rvms]);

    // Progressive batch rendering on Android to prevent Fabric crash
    useEffect(() => {
      if (Platform.OS !== 'android') return;
      if (visibleCount >= bufferedRvms.length) return;
      const timer = setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + ANDROID_BATCH_SIZE, bufferedRvms.length));
      }, ANDROID_BATCH_DELAY);
      return () => clearTimeout(timer);
    }, [visibleCount, bufferedRvms.length]);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
    }));

    const initialRegion = userLocation
      ? {
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : MAP_INITIAL_REGION;

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={Platform.OS === 'android' && isDark ? mapDarkStyle : []}
          {...(Platform.OS === 'ios' && { userInterfaceStyle: isDark ? 'dark' : 'light' })}
          onPress={onMapPress}
          onRegionChangeComplete={onRegionChange}
          mapPadding={{ top: Platform.OS === 'android' ? 80 : 70, right: 0, bottom: 0, left: 0 }}
        >
          {bufferedRvms
            .filter((rvm) => rvm.lat != null && rvm.lng != null)
            .slice(0, visibleCount)
            .map((rvm) => (
            <RvmMarker
              key={rvm.id}
              rvm={rvm}
              onPress={() => onMarkerPress?.(rvm)}
            />
          ))}
        </MapView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
