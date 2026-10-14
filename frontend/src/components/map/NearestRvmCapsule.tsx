import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Rvm } from '../../types';
import { LiveDistance } from '../common/LiveDistance';
import { getStatusColor } from '../../utils/statusColor';
import { theme } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';

interface Props {
  rvm: Rvm;
  onPress: () => void;
}

export function NearestRvmCapsule({ rvm, onPress }: Props) {
  const { colors } = useAppTheme();
  const dotColor = getStatusColor(rvm.status, rvm.queueLength);

  return (
    <TouchableOpacity
      style={[styles.capsule, { backgroundColor: colors.neutral[0] }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.name, { color: colors.neutral[800] }]} numberOfLines={1}>
        {rvm.name}
      </Text>
      <Text style={[styles.separator, { color: colors.neutral[400] }]}>·</Text>
      <LiveDistance
        targetLat={rvm.lat}
        targetLng={rvm.lng}
        format="short"
        style={{ ...styles.distance, color: colors.neutral[500] }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  capsule: {
    position: 'absolute',
    bottom: theme.spacing.lg + 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    maxWidth: '70%',
    ...theme.shadows.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  separator: {
    fontSize: theme.typography.fontSize.sm,
    marginHorizontal: theme.spacing.xs,
  },
  distance: {
    fontSize: theme.typography.fontSize.sm,
  },
});
