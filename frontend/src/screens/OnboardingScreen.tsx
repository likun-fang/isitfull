import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Linking,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppStore } from '../stores/useAppStore';

const { width } = Dimensions.get('window');

const pages = [
  {
    key: 'map',
    title: 'Find Nearby Machines',
    subtitle: 'Discover all Re-Turn machines near you across Ireland. Search by location or browse the map.',
    image: require('../../assets/onboarding/map.png'),
  },
  {
    key: 'status',
    title: 'Check Before You Go',
    subtitle: 'See real-time machine status — available, busy, or out of order — so you never waste a trip.',
    image: require('../../assets/onboarding/status.png'),
  },
  {
    key: 'deposit',
    title: 'Get Your Deposit Back',
    subtitle: 'Return your bottles and cans to get your 15c or 25c deposit back. We help you find a working machine.',
    image: require('../../assets/onboarding/deposit.png'),
  },
];

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);
  const setHasConsented = useAppStore((s) => s.setHasConsented);

  const isLastPage = currentIndex === pages.length - 1;

  const handleNext = useCallback(() => {
    if (isLastPage) {
      setHasConsented(true);
      setHasSeenOnboarding(true);
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  }, [currentIndex, isLastPage, setHasConsented, setHasSeenOnboarding]);

  const handleSkip = useCallback(() => {
    flatListRef.current?.scrollToIndex({ index: pages.length - 1 });
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[0], paddingTop: insets.top }]}>
      {!isLastPage && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.neutral[400] }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={[styles.imageContainer, { backgroundColor: colors.neutral[0] }]}>
              <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: colors.neutral[900] }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? colors.primary[500] : colors.neutral[200],
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary[500] }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLastPage ? 'Accept & Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {isLastPage && (
          <Text style={[styles.privacyNote, { color: colors.neutral[400] }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: colors.primary[600] }} onPress={() => Linking.openURL('https://isitfull.ie/privacy')}>
              Privacy Policy
            </Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary[600] }} onPress={() => Linking.openURL('https://isitfull.ie/terms')}>
              Terms of Service
            </Text>
            .
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: 260,
    height: 260,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    overflow: 'hidden',
  },
  illustration: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottom: {
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
});
