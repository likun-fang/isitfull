import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Icon } from '../common/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../../theme';

const STORAGE_KEY = 'download_banner_dismissed_at';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

async function checkShouldShowBanner(): Promise<boolean> {
  try {
    const dismissedAt = await AsyncStorage.getItem(STORAGE_KEY);
    if (!dismissedAt) {
      return true;
    }
    const dismissedTimestamp = parseInt(dismissedAt, 10);
    const now = Date.now();
    return now - dismissedTimestamp >= DISMISS_DURATION_MS;
  } catch {
    return true;
  }
}

async function storeDismissalTimestamp(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch {
    // Silently fail - banner will show again on next visit
  }
}

export function DownloadBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkShouldShowBanner().then(setIsVisible);
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    await storeDismissalTimestamp();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        <View style={styles.iconContainer}>
          <Icon name="smartphone" size={18} color={colors.primary[400]} />
        </View>
        <Text style={styles.text}>Get the app for free!</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => Linking.openURL('/downloads')}
          activeOpacity={0.85}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="x" size={16} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 22, 20, 0.92)',
    borderRadius: 9999,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    // @ts-ignore — web-only
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    maxWidth: 420,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  downloadButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 9999,
    marginLeft: spacing.sm,
  },
  downloadButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  closeButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
});
