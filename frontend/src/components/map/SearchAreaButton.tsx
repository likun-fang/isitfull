import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  visible: boolean;
  onPress: () => void;
  isLoading?: boolean;
}

export function SearchAreaButton({ visible, onPress, isLoading }: Props) {
  const { colors, isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity }]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isDark ? colors.neutral[100] : '#FFFFFF',
            shadowColor: '#000',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isDark ? colors.neutral[800] : colors.neutral[700]} />
        ) : (
          <Feather name="refresh-cw" size={14} color={isDark ? colors.neutral[800] : colors.neutral[700]} />
        )}
        <Text style={[styles.text, { color: isDark ? colors.neutral[800] : colors.neutral[800] }]}>
          Search This Area
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  text: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },
});
