import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from './src/lib/queryClient';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ModalPortalProvider } from './src/contexts/ModalPortalContext';
import { AuthProvider } from './src/providers/AuthProvider';
import { AppGate } from './src/components/gate/AppGate';
import { ThemeProvider } from './src/theme/ThemeContext';
import { initSentry, Sentry } from './src/lib/sentry';
// The stylesheet every web map needs, loaded once for the whole app. Metro turns CSS imports into empty modules on native.
import 'leaflet/dist/leaflet.css';

initSentry();

function ErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>
        The app encountered an unexpected error. Please restart the app.
      </Text>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <SafeAreaProvider>
            <ThemeProvider>
              <AppGate>
              <AuthProvider>
                <ActionSheetProvider>
                  <ModalPortalProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                  </ModalPortalProvider>
                </ActionSheetProvider>
              </AuthProvider>
            </AppGate>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistQueryClientProvider>
      </Sentry.ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Sentry.wrap(App);
