import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores';
import { authService } from '../services/authService';
import { secureStorage } from '../services/secureStorage';
import { theme } from '../theme';

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, setAccessToken, setHydrated } = useAuthStore();

  useEffect(() => {
    async function hydrate() {
      try {
        const tokens = await secureStorage.getTokens();

        if (tokens?.accessToken) {
          setAccessToken(tokens.accessToken);
          const user = await authService.getMe();

          if (user) {
            setUser(user);
            setHydrated(true);
            setIsLoading(false);
            return;
          }

          const refreshed = await authService.refresh();
          if (refreshed) {
            setAccessToken(refreshed.accessToken);
            setUser(refreshed.user);
            setHydrated(true);
            setIsLoading(false);
            return;
          }
        }

        const guestAuth = await authService.guestLogin();
        setAccessToken(guestAuth.accessToken);
        setUser(guestAuth.user);
      } catch (error) {
        console.error('Auth hydration failed:', error);
      } finally {
        setHydrated(true);
        setIsLoading(false);
      }
    }

    hydrate();
  }, [setUser, setAccessToken, setHydrated]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[0],
  },
});
