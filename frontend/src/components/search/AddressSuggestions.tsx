import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';
import { AddressSuggestion } from '../../types/address';

interface Props {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: string | null;
  onSelect: (suggestion: AddressSuggestion) => void;
}

export function AddressSuggestions({ suggestions, isLoading, error, onSelect }: Props) {
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }]}>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: colors.neutral[500] }]}>Searching...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }]}>
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={16} color={colors.neutral[400]} />
          <Text style={[styles.errorText, { color: colors.neutral[500] }]}>{error}</Text>
        </View>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }]}>
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion.placeId}
          style={[styles.suggestionRow, { borderBottomColor: colors.neutral[100] }]}
          onPress={() => onSelect(suggestion)}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.neutral[100] }]}>
            <Feather name="map-pin" size={16} color={colors.neutral[400]} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.primaryText, { color: colors.neutral[900] }]} numberOfLines={1}>
              {suggestion.shortName}
            </Text>
            {suggestion.secondaryText ? (
              <Text style={[styles.secondaryText, { color: colors.neutral[500] }]} numberOfLines={1}>
                {suggestion.secondaryText}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    ...theme.shadows.lg,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  secondaryText: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  errorText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },
});
