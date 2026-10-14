import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Expo configuration with environment variable support.
 *
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Replace placeholder with your actual Google Maps API key
 * 3. Get your API key from https://console.cloud.google.com/
 *
 * The EXPO_PUBLIC_GOOGLE_MAPS_API_KEY environment variable is required
 * for the map functionality to work on iOS and Android.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Is It Full?',
  slug: 'isitfull',
  owner: 'intelijake',
  scheme: 'isitfull',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ie.isitfull.mobile',
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'We need your location to find nearby recycling machines.',
      ITSAppUsesNonExemptEncryption: false,
      LSApplicationQueriesSchemes: ['comgooglemaps', 'googlegmail', 'ms-outlook'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'ie.isitfull.mobile',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
  },
  updates: {
    url: 'https://u.expo.dev/974d331a-9f19-455b-9ce5-1228695560b0',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-updates',
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    ],
    'expo-font',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'We need your location to find nearby recycling machines.',
      },
    ],
    'expo-secure-store',
    'expo-apple-authentication',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          buildReactNativeFromSource: true,
        },
        android: {
          forceDarkAllowed: false,
        },
      },
    ],
    './plugins/withFirebaseStaticFramework',
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to access your photos to attach screenshots to feedback.',
      },
    ],
  ],

  extra: {
    eas: {
      projectId: '974d331a-9f19-455b-9ce5-1228695560b0',
    },
  },
});
