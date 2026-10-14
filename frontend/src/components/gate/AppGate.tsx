import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppConfig } from '../../hooks/useAppConfig';
import { useAppTheme } from '../../theme/ThemeContext';
import { MaintenanceScreen } from './MaintenanceScreen';
import { ForceUpdateModal } from './ForceUpdateModal';

interface Props {
  children: React.ReactNode;
}

export function AppGate({ children }: Props) {
  const { colors } = useAppTheme();
  const { isLoading, maintenanceMode, maintenanceMessage, needsUpdate, retry } = useAppConfig();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.neutral[0] }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (maintenanceMode) {
    return <MaintenanceScreen message={maintenanceMessage} onRetry={retry} />;
  }

  if (needsUpdate) {
    return <ForceUpdateModal />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
