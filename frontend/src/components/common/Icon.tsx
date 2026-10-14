import React from 'react';
import { Feather } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  return (
    <Feather
      name={name as keyof typeof Feather.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
}
