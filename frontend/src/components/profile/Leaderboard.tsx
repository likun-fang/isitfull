import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TopContributor, RANK_INFO } from '../../types';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

export function Leaderboard() {
  const { colors } = useAppTheme();
  const { data: contributors, isLoading } = useQuery({
    queryKey: ['topContributors'],
    queryFn: async () => {
      const response = await api.get<{ data: TopContributor[] }>(
        '/users/top-contributors?limit=5'
      );
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - leaderboard doesn't need frequent updates
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.neutral[0] }]}>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Weekly Heroes</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (!contributors || contributors.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[0] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Top Contributors</Text>
        <Feather name="award" size={18} color={colors.primary[500]} />
      </View>

      <View style={styles.list}>
        {contributors.map((contributor, index) => (
          <LeaderboardItem
            key={contributor.id}
            contributor={contributor}
            rank={index + 1}
          />
        ))}
      </View>
    </View>
  );
}

interface LeaderboardItemProps {
  contributor: TopContributor;
  rank: number;
}

function LeaderboardItem({ contributor, rank }: LeaderboardItemProps) {
  const { colors } = useAppTheme();
  const rankInfo = RANK_INFO[contributor.rank];
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const medalColor = rank <= 3 ? medalColors[rank - 1] : undefined;

  return (
    <View style={styles.item}>
      <View style={[styles.rankBadge, { backgroundColor: colors.neutral[200] }, medalColor && { backgroundColor: medalColor }]}>
        <Text style={[styles.rankNumber, { color: colors.neutral[600] }, medalColor && { color: colors.neutral[0] }]}>
          {rank}
        </Text>
      </View>

      {contributor.avatarUrl ? (
        <Image source={{ uri: contributor.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.neutral[100] }]}>
          <Feather name="user" size={16} color={colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.neutral[900] }]} numberOfLines={1}>
            {contributor.displayName || 'Anonymous'}
          </Text>
          <Text style={styles.rankEmoji}>{rankInfo?.emoji || '🌱'}</Text>
        </View>
        <Text style={[styles.karma, { color: colors.neutral[500] }]}>{contributor.karmaPoints} karma</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  rankEmoji: {
    fontSize: 14,
  },
  karma: {
    fontSize: theme.typography.fontSize.sm,
  },
});
