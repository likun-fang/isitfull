import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../../theme';
import { api } from '../../services/api';

interface DashboardStatsData {
  todaysReports: number;
  activeRate: number;
  topContributor: string;
}

interface StatItemProps {
  emoji: string;
  value: string;
  label: string;
}

function StatItem({ emoji, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function DashboardStats() {
  const { data, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/stats/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tagline}>
        Join 5,000+ users keeping Ireland's recycling network running.
      </Text>
      <View style={styles.statsRow}>
        <StatItem
          emoji="🔥"
          value={String(data?.todaysReports ?? 0)}
          label="Today's Reports"
        />
        <StatItem
          emoji="🟢"
          value={`${data?.activeRate ?? 0}%`}
          label="Active"
        />
        <StatItem
          emoji="🏆"
          value={data?.topContributor ?? '-'}
          label="Top Contributor"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[50],
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
});
