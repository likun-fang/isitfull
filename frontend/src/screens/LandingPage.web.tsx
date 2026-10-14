import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Platform, TouchableOpacity, Text } from 'react-native';
import { Icon } from '../components/common/Icon';
import { HeroSection } from '../components/landing/HeroSection';
import { RvmListView } from '../components/landing/RvmListView';
import { MiniMap } from '../components/landing/MiniMap.web';
import { DashboardStats } from '../components/landing/DashboardStats';
import { DownloadBanner } from '../components/landing/DownloadBanner';
import { LocationDenied } from '../components/landing/LocationDenied';
import { SuccessModal } from '../components/landing/SuccessModal';
import { HeroMapBackground } from '../components/landing/HeroMapBackground.web';
import { useNearbyRvms } from '../hooks/useNearbyRvms';
import { useAddressSearch } from '../hooks/useAddressSearch';
import { AddressSuggestion } from '../types/address';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { theme } from '../theme';
import { Rvm, RvmStatus } from '../types';

const DUBLIN_CENTER = { latitude: 53.349805, longitude: -6.26031 };

type ViewState = 'hero' | 'list' | 'location-denied';

interface LocationState {
  latitude: number;
  longitude: number;
}

export default function LandingPage() {
  const [viewState, setViewState] = useState<ViewState>('hero');
  const [location, setLocation] = useState<LocationState | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const { setAccessToken, setUser } = useAuthStore();

  // Silent guest login for web
  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (token) return;
    authService.guestLogin()
      .then((auth) => {
        setAccessToken(auth.accessToken);
        setUser(auth.user);
      })
      .catch(() => {});
  }, [setAccessToken, setUser]);

  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: rvms, isLoading: rvmsLoading, refetch } = useNearbyRvms(location, 1000, 5);
  const { data: backgroundRvms } = useNearbyRvms(accessToken ? DUBLIN_CENTER : null, 5000, 50);
  const { setQuery, suggestions, isLoading: isSearching } = useAddressSearch();

  const requestLocation = useCallback((): Promise<boolean> => {
    setIsRequestingLocation(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setIsRequestingLocation(false);
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsRequestingLocation(false);
          resolve(true);
        },
        () => {
          setIsRequestingLocation(false);
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  const handleFindNearest = useCallback(async () => {
    const granted = await requestLocation();
    if (granted) {
      setViewState('list');
    } else {
      setViewState('location-denied');
    }
  }, [requestLocation]);

  const handleSearch = useCallback((query: string) => {
    setQuery(query);
  }, [setQuery]);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    setLocation({
      latitude: suggestion.lat,
      longitude: suggestion.lng,
    });
    setViewState('list');
  }, []);

  const handleBack = useCallback(() => {
    setViewState('hero');
    setLocation(null);
  }, []);

  const handleSearchClick = useCallback(() => {
    setViewState('hero');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleRvmPress = useCallback((rvm: Rvm) => {
    // For web landing page, we could navigate to detail or show info
    // For now, this is a placeholder for future navigation
  }, []);

  const handleReport = useCallback(async (rvmId: number, status: RvmStatus) => {
    if (!location) {
      return;
    }

    try {
      await reportService.create(rvmId, {
        status,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      refetch();
      setShowSuccessModal(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit report';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  }, [location, refetch]);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const renderContent = () => {
    switch (viewState) {
      case 'hero':
        return (
          <HeroSection
            onFindNearest={handleFindNearest}
            onSearch={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={suggestions}
            isSearching={isSearching}
          />
        );

      case 'list':
        return (
          <View style={styles.listContainer}>
            <View style={styles.listPadded}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={20} color={theme.colors.neutral[700]} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <MiniMap location={location} rvms={rvms} />
            <View style={styles.listPadded}>
              <RvmListView
                rvms={rvms}
                isLoading={rvmsLoading || isRequestingLocation}
                onRvmPress={handleRvmPress}
                onReport={handleReport}
              />
            </View>
          </View>
        );

      case 'location-denied':
        return <LocationDenied onSearchClick={handleSearchClick} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {viewState === 'hero' && <HeroMapBackground rvms={backgroundRvms} />}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        {/* <DashboardStats /> */}
      </ScrollView>
      <DownloadBanner />
      <div style={{ textAlign: 'center', padding: '12px 24px', borderTop: `1px solid ${theme.colors.neutral[200]}` }}>
        <span style={{ fontSize: 12, color: theme.colors.neutral[400] }}>
          This is an independent community project and is not affiliated with, endorsed by, or connected to{' '}
          <a href="https://re-turn.ie/" rel="nofollow" style={{ color: theme.colors.neutral[400] }}>Re-turn</a>{' '}
          or the Deposit Return Scheme operator.
        </span>
      </div>
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[0],
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  listPadded: {
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[700],
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
});
