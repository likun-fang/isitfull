import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Rvm } from '../../types';

interface Props {
  rvm: Rvm;
  onPress?: () => void;
}

export function RvmMarker({ rvm }: Props) {
  return <View style={styles.marker} />;
}

const styles = StyleSheet.create({
  marker: {
    display: 'none',
  },
});
