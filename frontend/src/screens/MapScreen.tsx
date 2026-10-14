import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, Keyboard, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList } from '../navigation/AppNavigator';
import { Region } from 'react-native-maps';
import { RvmMap, RvmMapRef } from '../components/map/RvmMap';
import { RvmDetailSheet } from '../components/rvm/RvmDetailSheet';
import { ReportModal } from '../components/rvm/ReportModal';
import { LevelUpModal } from '../components/rvm/LevelUpModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { SearchBar } from '../components/search/SearchBar';
import { AddressSuggestions } from '../components/search/AddressSuggestions';
import { LocationButton } from '../components/map/LocationButton';
import { SearchAreaButton } from '../components/map/SearchAreaButton';
import { NearestRvmCapsule } from '../components/map/NearestRvmCapsule';

import { useLocation } from '../hooks/useLocation';
import { useLocationStore } from '../stores/useLocationStore';
import { useNearbyRvms } from '../hooks/useNearbyRvms';
import { useNearestAvailableRvm } from '../hooks/useNearestAvailableRvm';
import { useRvmDetail } from '../hooks/useRvmDetail';
import { useAddressSearch } from '../hooks/useAddressSearch';
import { useReportStatus } from '../hooks/useReportStatus';
import { haversineDistance } from '../utils/distance';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';
import { Rvm, RvmStatus, QueueLength, UserRank } from '../types';
import { AddressSuggestion } from '../types/address';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const route = useRoute<RouteProp<RootTabParamList, 'Map'>>();
  const [selectedRvmId, setSelectedRvmId] = useState<number | null>(null);
  const [reportingRvm, setReportingRvm] = useState<Rvm | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{
    show: boolean;
    previousRank: UserRank;
    newRank: UserRank;
  } | null>(null);
  const mapRef = useRef<RvmMapRef>(null);
  const isSelectingRef = useRef(false);
  const { location, loading: locationLoading, error: locationError, getLocation } = useLocation();

  // Use searchCenter for RVM queries (only updates on search/button click)
  // `location` is stable (first-fix only), so queryLocation won't change on every GPS update
  const queryLocation = searchCenter || location;
  const { data: rvms = [], isLoading: rvmsLoading, refetch } = useNearbyRvms(queryLocation);
  const { data: selectedRvm } = useRvmDetail(selectedRvmId);
  const { query, setQuery, suggestions, isLoading: searchLoading, error: searchError, clearSearch, flushSearch } = useAddressSearch();
  const { mutateAsync: submitReport } = useReportStatus();
  const nearestAvailable = useNearestAvailableRvm(rvms);

  // Hide capsule when map is panned far from user's actual location
  const userLat = useLocationStore((s) => s.latitude);
  const userLng = useLocationStore((s) => s.longitude);
  const isMapNearUser = useMemo(() => {
    if (!mapCenter || userLat == null || userLng == null) return true;
    return haversineDistance({ latitude: userLat, longitude: userLng }, mapCenter) < 500;
  }, [mapCenter, userLat, userLng]);

  // Handle navigation from Favorites → focus on a specific RVM
  useEffect(() => {
    const params = route.params;
    if (params?.focusRvmId && params.focusLat && params.focusLng) {
      setSelectedRvmId(params.focusRvmId);
      setIsSearchTriggered(true);
      setShowSearchButton(false);
      const center = { latitude: params.focusLat, longitude: params.focusLng };
      setSearchCenter(center);
      setMapCenter(center);
      mapRef.current?.animateToRegion({
        ...center,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [route.params]);

  // Show "Search This Area" when user physically moves far from last query center
  useEffect(() => {
    if (!queryLocation) return;
    const unsubscribe = useLocationStore.subscribe((state) => {
      if (state.latitude == null || state.longitude == null) return;
      const distance = haversineDistance(
        { latitude: state.latitude, longitude: state.longitude },
        queryLocation
      );
      if (distance > 500) {
        setShowSearchButton(true);
      }
    });
    return unsubscribe;
  }, [queryLocation]);

  const handleOpenReport = (rvm: Rvm) => {
    setReportingRvm(rvm);
    setSelectedRvmId(null);
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
    setReportingRvm(null);
  };

  const handleSubmitReport = useCallback(async (status: RvmStatus, queueLength: QueueLength | null) => {
    const currentLocation = getLocation();
    if (!reportingRvm || !currentLocation) {
      throw new Error('Unable to submit report');
    }

    const result = await submitReport({
      rvmId: reportingRvm.id,
      status,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      queueLength: queueLength ?? undefined,
    });

    // Show level-up modal if user leveled up
    // Delay to ensure report modal has fully closed (success shows for ~1.8s)
    if (result.leveledUp === true && result.previousRank && result.newRank) {
      setTimeout(() => {
        setLevelUpInfo({
          show: true,
          previousRank: result.previousRank as UserRank,
          newRank: result.newRank as UserRank,
        });
      }, 2200);
    }
  }, [reportingRvm, getLocation, submitReport]);

  const handleRegionChange = (region: Region) => {
    const newCenter = { latitude: region.latitude, longitude: region.longitude };
    setMapCenter(newCenter);

    if (isSearchTriggered) {
      // Search or return-to-location triggered this move, don't show button
      setIsSearchTriggered(false);
      setShowSearchButton(false);
    } else {
      // User panned manually, show button
      setShowSearchButton(true);
    }
  };

  const handleSearchArea = () => {
    if (mapCenter) {
      setSearchCenter(mapCenter);
    }
    setShowSearchButton(false);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    // Validate coordinates before animating
    if (!suggestion.lat || !suggestion.lng || (suggestion.lat === 0 && suggestion.lng === 0)) {
      return;
    }

    // Guard: prevent onChangeText/onFocus from re-enabling suggestions.
    // On iOS, Keyboard.dismiss() calls endEditing:YES which can commit
    // pending QuickType text and fire onChangeText AFTER our state updates.
    isSelectingRef.current = true;

    const newCenter = { latitude: suggestion.lat, longitude: suggestion.lng };

    // Set flag to skip showing button after animation
    setIsSearchTriggered(true);
    setShowSearchButton(false);

    // Update both searchCenter (for query) and mapCenter
    setSearchCenter(newCenter);
    setMapCenter(newCenter);

    mapRef.current?.animateToRegion({
      latitude: suggestion.lat,
      longitude: suggestion.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
    clearSearch();
    setShowSuggestions(false);
    Keyboard.dismiss();

    // Reset guard after keyboard dismiss events have settled
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 300);
  };

  const handleReturnToLocation = () => {
    const currentLocation = getLocation();
    if (currentLocation) {
      const userCenter = { latitude: currentLocation.latitude, longitude: currentLocation.longitude };
      setIsSearchTriggered(true);
      setShowSearchButton(false);
      setSearchCenter(userCenter);
      setMapCenter(userCenter);
      mapRef.current?.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleSearchSubmit = () => {
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const handleNearestPress = useCallback(() => {
    if (!nearestAvailable) return;
    const { rvm } = nearestAvailable;
    setIsSearchTriggered(true);
    setShowSearchButton(false);
    mapRef.current?.animateToRegion({
      latitude: rvm.lat,
      longitude: rvm.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setTimeout(() => setSelectedRvmId(rvm.id), 500);
  }, [nearestAvailable]);

  if (locationLoading) {
    return <LoadingSpinner />;
  }

  if (locationError && !location) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.neutral[50] }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{locationError}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <OfflineIndicator />
      <View style={[styles.searchContainer, { top: insets.top + 12 }]}>
        <SearchBar
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.length >= 2 && !isSelectingRef.current) {
              setShowSuggestions(true);
            } else if (text.length < 2) {
              setShowSuggestions(false);
            }
          }}
          onClear={() => {
            clearSearch();
            setShowSuggestions(false);
          }}
          onFocus={() => {
            if (query.length >= 2 && !isSelectingRef.current) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Don't flush on blur - debounce timer handles it.
            // Flushing here causes a race condition when selecting suggestions.
          }}
          onSubmit={handleSearchSubmit}
        />
        {Platform.OS !== 'web' && showSuggestions && (query.length >= 2 || searchLoading || searchError) && (
          <AddressSuggestions
            suggestions={suggestions}
            isLoading={searchLoading}
            error={searchError}
            onSelect={handleSelectSuggestion}
          />
        )}
        {!showSuggestions && (
          <SearchAreaButton
            visible={showSearchButton}
            onPress={handleSearchArea}
            isLoading={rvmsLoading}
          />
        )}
      </View>

      <RvmMap
        ref={mapRef}
        rvms={rvms}
        userLocation={location}
        onMarkerPress={(rvm) => setSelectedRvmId(rvm.id)}
        onMapPress={() => {
          setShowSuggestions(false);
          Keyboard.dismiss();
        }}
        onRegionChange={handleRegionChange}
      />

      {Platform.OS !== 'web' && (
        <LocationButton onPress={handleReturnToLocation} />
      )}

      {Platform.OS !== 'web' && nearestAvailable && isMapNearUser && !selectedRvmId && !showReportModal && (
        <NearestRvmCapsule
          rvm={nearestAvailable.rvm}
          onPress={handleNearestPress}
        />
      )}

      {rvmsLoading && rvms.length === 0 && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner size="small" />
        </View>
      )}

      {/* RVM Detail Bottom Sheet */}
      <BottomSheet
        visible={!!selectedRvm}
        onClose={() => setSelectedRvmId(null)}
      >
        {selectedRvm && (
          <RvmDetailSheet
            rvm={selectedRvm}
            onReport={() => handleOpenReport(selectedRvm)}
            onClose={() => setSelectedRvmId(null)}
          />
        )}
      </BottomSheet>

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        rvm={reportingRvm}
        onClose={handleCloseReport}
        onSubmit={handleSubmitReport}
      />

      {/* Level Up Modal - always rendered, visibility controlled by prop */}
      <LevelUpModal
        visible={levelUpInfo?.show ?? false}
        previousRank={levelUpInfo?.previousRank ?? 'ECO_NEWBIE'}
        newRank={levelUpInfo?.newRank ?? 'ECO_NEWBIE'}
        onClose={() => setLevelUpInfo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
});
