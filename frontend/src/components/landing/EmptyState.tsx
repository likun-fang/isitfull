import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../common/Icon';
import { theme } from '../../theme';
import { openDownloadsPage } from './openDownloadsPage';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Icon
        name="map-pin"
        size={48}
        color={theme.colors.neutral[300]}
        style={styles.icon}
      />

      <Text style={styles.title}>No machines found nearby.</Text>

      <Text style={styles.description}>
        Try searching a different Eircode, or download the App to see the full
        nationwide map.
      </Text>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={openDownloadsPage}
        activeOpacity={0.8}
      >
        <Text style={styles.downloadButtonText}>Get the App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  downloadButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
  },
  downloadButtonText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
});
