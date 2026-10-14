import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  onPress: () => void;
}

export function LocationButton({ onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.neutral[0] }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name="navigation" size={24} color={colors.primary[600]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg + 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
});
