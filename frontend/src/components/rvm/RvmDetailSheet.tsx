import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Feather } from '@expo/vector-icons';
import { Rvm, QueueLength, RANK_INFO, IssueReason } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusColor';
import { useFavorites } from '../../hooks/useFavorites';
import { rvmService } from '../../services/rvmService';
import { LiveDistance } from '../common/LiveDistance';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  rvm: Rvm;
  onReport: () => void;
  onClose: () => void;
}

export function RvmDetailSheet({ rvm, onReport, onClose }: Props) {
  const { showActionSheetWithOptions } = useActionSheet();
  const { colors } = useAppTheme();
  const statusConfig = STATUS_CONFIG[rvm.status] || STATUS_CONFIG.UNKNOWN;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isRvmFavorite = isFavorite(rvm.id);
  const [isReportingIssue, setIsReportingIssue] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(rvm.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleReportIssue = () => {
    const reasons: { label: string; value: IssueReason }[] = [
      { label: 'Machine does not exist', value: 'DOES_NOT_EXIST' },
      { label: 'Location is wrong', value: 'WRONG_LOCATION' },
      { label: 'Duplicate listing', value: 'DUPLICATE' },
      { label: 'Other', value: 'OTHER' },
    ];
    const options = [...reasons.map((r) => r.label), 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'What\'s wrong with this machine?',
      },
      async (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;
        const reason = reasons[selectedIndex].value;
        setIsReportingIssue(true);
        try {
          const message = await rvmService.reportIssue(rvm.id, reason);
          Alert.alert('Thank you', message);
        } catch (error: any) {
          const msg = error?.response?.data?.message || 'Failed to submit report. Please try again.';
          Alert.alert('Error', msg);
        } finally {
          setIsReportingIssue(false);
        }
      },
    );
  };

  const openDirections = async () => {
    const dest = `${rvm.lat},${rvm.lng}`;
    const encodedName = encodeURIComponent(rvm.name);
    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;

    if (Platform.OS === 'web') {
      window.open(webFallback, '_blank');
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const canOpen = await Linking.canOpenURL(`google.navigation:q=${dest}`).catch(() => false);
        if (canOpen) {
          await Linking.openURL(`google.navigation:q=${dest}`);
        } else {
          await Linking.openURL(webFallback);
        }
      } catch {
        Alert.alert('Unable to open', 'Could not open the navigation app. Please try again.');
      }
      return;
    }

    showActionSheetWithOptions(
      {
        options: ['Google Maps', 'Apple Maps', 'Cancel'],
        cancelButtonIndex: 2,
        title: 'Select app for navigation',
      },
      async (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === 2) return;
        try {
          if (selectedIndex === 0) {
            const canOpen = await Linking.canOpenURL(`comgooglemaps://?daddr=${dest}&directionsmode=driving`).catch(() => false);
            if (canOpen) {
              await Linking.openURL(`comgooglemaps://?daddr=${dest}&directionsmode=driving`);
            } else {
              await Linking.openURL(webFallback);
            }
          } else {
            await Linking.openURL(`maps:?daddr=${dest}&q=${encodedName}`);
          }
        } catch {
          Alert.alert('Unable to open', 'Could not open the navigation app. Please try again.');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusIndicator, { backgroundColor: statusConfig.color }]} />
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: colors.neutral[900] }]} numberOfLines={2}>{rvm.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={colors.neutral[400]} />
            <Text style={[styles.location, { color: colors.neutral[500] }]}>
              {rvm.city} · <LiveDistance targetLat={rvm.lat} targetLng={rvm.lng} format="long" />
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Feather name="heart" size={22} color={isRvmFavorite ? '#EF4444' : colors.neutral[300]} />
        </TouchableOpacity>
      </View>

      <View style={[styles.statusCard, { backgroundColor: `${statusConfig.color}08` }]}>
        <View style={styles.statusContent}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {rvm.status === 'AVAILABLE' && rvm.confidenceScore <= 20
                ? 'Likely Available'
                : statusConfig.label}
            </Text>
            <Text style={[styles.statusSubtext, { color: colors.neutral[400] }]}>
              {rvm.status === 'AVAILABLE' && rvm.confidenceScore <= 20
                ? 'No recent reports'
                : rvm.confidenceScore > 70 ? 'High confidence'
                : rvm.confidenceScore > 40 ? 'Moderate confidence'
                : 'Low confidence'}
            </Text>
          </View>
        </View>
        {rvm.queueLength && (
          <View style={[styles.queueRow, { borderTopColor: colors.neutral[200] }]}>
            <Feather
              name={QUEUE_CONFIG[rvm.queueLength].icon as any}
              size={14}
              color={QUEUE_CONFIG[rvm.queueLength].color}
            />
            <Text style={[styles.queueText, { color: QUEUE_CONFIG[rvm.queueLength].color }]}>
              {QUEUE_CONFIG[rvm.queueLength].label}
            </Text>
          </View>
        )}
        {rvm.statusUpdatedAt && (
          <View style={[styles.reporterRow, { borderTopColor: colors.neutral[200] }]}>
            <Text style={[styles.updatedAt, { color: colors.neutral[400] }]}>
              Updated {getTimeAgo(rvm.statusUpdatedAt)}
            </Text>
            {rvm.lastReporter && (
              <View style={styles.reporterInfo}>
                <Text style={[styles.reporterText, { color: colors.neutral[400] }]}>by </Text>
                <Text style={[styles.reporterName, { color: colors.neutral[700] }]}>{rvm.lastReporter.displayName}</Text>
                <Text style={styles.reporterRank}>
                  {' '}{RANK_INFO[rvm.lastReporter.rank]?.emoji || '🌱'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary[600] }]}
          onPress={openDirections}
          activeOpacity={0.8}
        >
          <Feather name="navigation" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Get Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.primary[50] }]}
          onPress={onReport}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={18} color={colors.primary[600]} />
          <Text style={[styles.secondaryButtonText, { color: colors.primary[600] }]}>Update Status</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.reportIssueLink}
        onPress={handleReportIssue}
        disabled={isReportingIssue}
        activeOpacity={0.6}
      >
        <Feather name="flag" size={13} color={colors.neutral[400]} />
        <Text style={[styles.reportIssueLinkText, { color: colors.neutral[400] }]}>
          {isReportingIssue ? 'Submitting...' : 'Report an issue with this machine'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'web' && <View style={{ height: 80 }} />}
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const QUEUE_CONFIG: Record<QueueLength, { label: string; icon: string; color: string }> = {
  NONE: { label: 'No queue', icon: 'check-circle', color: '#059669' },
  SHORT: { label: 'Short queue', icon: 'clock', color: '#F59E0B' },
  LONG: { label: 'Long queue', icon: 'alert-circle', color: '#EF4444' },
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 4,
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: 2,
    marginRight: 14,
  },
  headerContent: {
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    marginLeft: 5,
  },
  statusCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 13,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  queueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  updatedAt: {
    fontSize: 12,
  },
  reporterRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reporterText: {
    fontSize: 12,
  },
  reporterName: {
    fontSize: 12,
    fontWeight: '600',
  },
  reporterRank: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportIssueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  reportIssueLinkText: {
    fontSize: 13,
  },
});
