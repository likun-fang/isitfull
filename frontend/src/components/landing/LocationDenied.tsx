import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../common/Icon';
import { theme } from '../../theme';

interface Props {
  onSearchClick: () => void;
}

export function LocationDenied({ onSearchClick }: Props) {
  return (
    <View style={styles.container}>
      <Icon
        name="map-pin"
        size={48}
        color={theme.colors.neutral[300]}
        style={styles.icon}
      />

      <Text style={styles.title}>Location access needed</Text>

      <Text style={styles.description}>
        We need your location to find nearby RVMs.{'\n\n'}Please enable GPS in
        your browser settings, or type your Eircode in the search box above.
      </Text>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={onSearchClick}
        activeOpacity={0.8}
      >
        <Icon
          name="search"
          size={18}
          color={theme.colors.primary[600]}
          style={styles.buttonIcon}
        />
        <Text style={styles.searchButtonText}>Search by Eircode</Text>
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
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  searchButtonText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
});
