import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useIsGuest } from '../stores';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { theme, type Colors } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';
import { RANK_INFO, KarmaLog, UserRank, User } from '../types';
import { EditNameModal } from '../components/profile/EditNameModal';
import { Leaderboard } from '../components/profile/Leaderboard';

const INITIAL_ACTIVITY_COUNT = 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isGuest = useIsGuest();
  const [showEditName, setShowEditName] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const { data: karmaLogs, isLoading, refetch } = useQuery({
    queryKey: ['karmaLogs'],
    queryFn: async () => {
      const response = await api.get<{ data: KarmaLog[] }>('/users/me/karma-logs?size=10');
      return response.data.data || [];
    },
    enabled: !isGuest,
  });

  const handleUpdateName = async (newName: string) => {
    const response = await api.patch<{ data: User }>('/users/me/display-name', {
      displayName: newName,
    });
    if (response.data.data && user) {
      setUser({ ...user, displayName: response.data.data.displayName });
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'You will be signed out and continue as a guest.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await authService.logout();
              useAuthStore.getState().logout();
              const guestAuth = await authService.guestLogin();
              useAuthStore.getState().setAccessToken(guestAuth.accessToken);
              useAuthStore.getState().setUser(guestAuth.user);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              useAuthStore.getState().logout();
              const guestAuth = await authService.guestLogin();
              useAuthStore.getState().setAccessToken(guestAuth.accessToken);
              useAuthStore.getState().setUser(guestAuth.user);
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const { colors } = useAppTheme();

  if (!user) return null;

  const rankInfo = RANK_INFO[user.rank];
  const nextRank = getNextRank(user.rank);
  const progress = nextRank
    ? ((user.karmaPoints - rankInfo.minKarma) /
        (RANK_INFO[nextRank].minKarma - rankInfo.minKarma)) *
      100
    : 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[50] }]}>
      <View style={[styles.header, { backgroundColor: colors.neutral[0], borderBottomColor: colors.neutral[200] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.neutral[900] }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={[styles.profileCard, { backgroundColor: colors.neutral[0] }]}>
          {isGuest ? (
            <TouchableOpacity
              style={styles.guestSignInArea}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.neutral[100] }]}>
                <Feather name="user" size={40} color={colors.neutral[400]} />
              </View>
              <Text style={[styles.displayName, { color: colors.neutral[900] }]}>Guest</Text>
              <View style={[styles.guestSignInButton, { backgroundColor: colors.primary[600] }]}>
                <Feather name="log-in" size={16} color={colors.neutral[0]} />
                <Text style={[styles.guestSignInButtonText, { color: colors.neutral[0] }]}>Sign in to save progress</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.neutral[100] }]}>
                  <Feather name="user" size={40} color={colors.neutral[400]} />
                </View>
              )}

              <View style={styles.nameRow}>
                <Text style={[styles.displayName, { color: colors.neutral[900] }]}>
                  {user.displayName || 'User'}
                </Text>
                <TouchableOpacity
                  style={styles.editNameIcon}
                  onPress={() => setShowEditName(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="edit-2" size={14} color={colors.neutral[400]} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.rankBadge}>
            <Text style={styles.rankEmoji}>{rankInfo.emoji}</Text>
            <Text style={[styles.rankName, { color: colors.neutral[600] }]}>{rankInfo.name}</Text>
          </View>

          <Text style={[styles.karmaPoints, { color: colors.primary[600] }]}>{user.karmaPoints} karma</Text>

          {nextRank && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.neutral[200] }]}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary[500] }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.neutral[500] }]}>
                {RANK_INFO[nextRank].minKarma - user.karmaPoints} to{' '}
                {RANK_INFO[nextRank].name}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.neutral[0] }]}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>My Impact</Text>
          <View style={styles.statsRow}>
            <StatItem label="Reports" value={user.karmaPoints / 10} colors={colors} />
            <StatItem label="First!" value={Math.floor(user.karmaPoints / 50)} colors={colors} />
            <StatItem label="Fixes" value={Math.floor(user.karmaPoints / 20)} colors={colors} />
          </View>
        </View>

        {!isGuest && karmaLogs && karmaLogs.length > 0 && (
          <View style={[styles.activityCard, { backgroundColor: colors.neutral[0] }]}>
            <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Recent Activity</Text>
            {(showAllActivity ? karmaLogs : karmaLogs.slice(0, INITIAL_ACTIVITY_COUNT)).map((log) => (
              <View key={log.id} style={[styles.activityItem, { borderBottomColor: colors.neutral[100] }]}>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityRvm, { color: colors.neutral[900] }]}>
                    {log.rvmName || 'Unknown RVM'}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.neutral[500] }]}>
                    {formatRelativeTime(log.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.activityPoints, { color: colors.success }]}>+{log.points}</Text>
              </View>
            ))}
            {karmaLogs.length > INITIAL_ACTIVITY_COUNT && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllActivity(!showAllActivity)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary[600] }]}>
                  {showAllActivity ? 'Show less' : `Show ${karmaLogs.length - INITIAL_ACTIVITY_COUNT} more`}
                </Text>
                <Feather
                  name={showAllActivity ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primary[600]}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Leaderboard */}
        <Leaderboard />

        {!isGuest && (
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={handleSignOut} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.footerLinkText, { color: colors.neutral[400] }]}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.neutral[300] }]}>·</Text>
            <TouchableOpacity onPress={handleDeleteAccount} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.footerLinkText, { color: colors.neutral[400] }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Name Modal */}
      <EditNameModal
        visible={showEditName}
        currentName={user.displayName || ''}
        onClose={() => setShowEditName(false)}
        onSave={handleUpdateName}
      />
    </View>
  );
}

function StatItem({ label, value, colors }: { label: string; value: number; colors: Colors }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.primary[600] }]}>{Math.floor(value)}</Text>
      <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>{label}</Text>
    </View>
  );
}

function getNextRank(currentRank: UserRank): UserRank | null {
  const ranks = Object.keys(RANK_INFO) as UserRank[];
  const currentIndex = ranks.indexOf(currentRank);
  return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  profileCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.md,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  editNameIcon: {
    padding: 4,
    marginLeft: 6,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  rankEmoji: {
    fontSize: 20,
  },
  rankName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  karmaPoints: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
  },
  statsCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  activityCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityRvm: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: theme.typography.fontSize.sm,
  },
  activityPoints: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  showMoreText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  signInCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  signInCtaText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  guestSignInArea: {
    alignItems: 'center',
    width: '100%',
  },
  guestSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  guestSignInButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    gap: theme.spacing.sm,
  },
  footerLinkText: {
    fontSize: theme.typography.fontSize.sm,
  },
  footerDot: {
    fontSize: theme.typography.fontSize.sm,
  },
});
