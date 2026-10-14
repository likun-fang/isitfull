import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RvmStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusColor';

interface Props {
  status: RvmStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: config.color }, isSmall && styles.badgeSmall]}>
      <Feather
        name={config.icon as any}
        size={isSmall ? 12 : 16}
        color="white"
      />
      <Text style={[styles.label, isSmall && styles.labelSmall]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 12,
  },
});
