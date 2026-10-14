import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.warn('Sentry DSN not configured — skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version
      ? `${Constants.expoConfig.slug}@${Constants.expoConfig.version}`
      : undefined,

    tracesSampleRate: 0.2,

    attachScreenshot: true,
    enableNative: true,
    enableNativeCrashHandling: true,

    beforeSend: (event) => {
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

export { Sentry };
