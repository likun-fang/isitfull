import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { authService } from '../services/authService';
import { signInWithGoogle, signInWithApple } from '../services/firebase';
import { useAuthStore } from '../stores';
import { useFavorites } from '../hooks/useFavorites';
import { theme } from '../theme';
import { useAppTheme } from '../theme/ThemeContext';

type LoginRouteParams = {
  reason?: string;
  onSuccess?: () => void;
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const route = useRoute<RouteProp<{ Login: LoginRouteParams }, 'Login'>>();
  const { setUser, setAccessToken } = useAuthStore();
  const { syncFavoritesOnLogin } = useFavorites();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Apple Sign In is supported on all iOS 13+ devices (Expo minimum)
  const appleAvailable = Platform.OS === 'ios';

  const reason = route.params?.reason;

  const handleSuccess = (merged?: { pointsMerged: number }) => {
    if (merged && merged.pointsMerged > 0) {
      Alert.alert(
        'Account Linked!',
        `We found ${merged.pointsMerged} karma points on this device.`,
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } else {
      navigation.goBack();
    }
    route.params?.onSuccess?.();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      // Get Firebase token from Google Sign-In
      const firebaseToken = await signInWithGoogle();
      // Send to backend
      const result = await authService.firebaseLogin(firebaseToken);
      setUser(result.user);
      setAccessToken(result.accessToken);
      // Sync local favorites to server
      await syncFavoritesOnLogin();
      handleSuccess(result.merged);
    } catch (error: unknown) {
      const signInError = error as { code?: string; message?: string };
      // User cancelled
      if (signInError.code === 'SIGN_IN_CANCELLED' ||
          signInError.code === '12501') {
        // Do nothing, user cancelled
      } else {
        console.error('Google sign in error:', error);
        Alert.alert('Sign In Failed', 'Could not sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') return;

    try {
      // Don't show loading until Apple native sheet is dismissed
      const firebaseToken = await signInWithApple();
      // Now show loading while we talk to backend
      setIsLoading(true);
      setLoadingProvider('apple');
      // Send to backend
      const result = await authService.firebaseLogin(firebaseToken);
      setUser(result.user);
      setAccessToken(result.accessToken);
      // Sync local favorites to server
      await syncFavoritesOnLogin();
      handleSuccess(result.merged);
    } catch (error: unknown) {
      const appleError = error as { code?: string };
      if (appleError.code !== '1001') { // User cancelled
        console.error('Apple sign in error:', error);
        Alert.alert('Sign In Failed', 'Could not sign in with Apple. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.neutral[0] }]}>
      <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
        <Feather name="x" size={24} color={colors.neutral[800]} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Feather name="user" size={64} color={colors.primary[500]} />
          <Text style={[styles.title, { color: colors.neutral[900] }]}>Sign In</Text>
          {reason && <Text style={[styles.subtitle, { color: colors.primary[500] }]}>{reason}</Text>}
          <Text style={[styles.description, { color: colors.neutral[500] }]}>
            Sign in to save your karma points and access them on any device.
          </Text>
        </View>

        <View style={styles.buttons}>
          {/* Apple Sign In - iOS only */}
          {Platform.OS === 'ios' && appleAvailable && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {loadingProvider === 'apple' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="smartphone" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Google Sign In - All platforms */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="mail" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.neutral[500] }]}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  buttons: {
    gap: 16,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
  },
  skipText: {
    fontSize: 16,
  },
});
