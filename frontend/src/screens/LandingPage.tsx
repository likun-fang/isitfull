import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Native placeholder - LandingPage is only used on web
// This file exists to prevent Metro from loading the .web.tsx version on native platforms
export default function LandingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This screen is only available on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
  },
});
