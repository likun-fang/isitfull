import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PrivacyPage from '../screens/PrivacyPage';
import TermsPage from '../screens/TermsPage';
import SupportPage from '../screens/SupportPage';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useAppStore } from '../stores/useAppStore';
// Metro will automatically resolve to LandingPage.web.tsx on web, LandingPage.tsx on native
import LandingPage from '../screens/LandingPage';

export type RootTabParamList = {
  Map: { focusRvmId?: number; focusLat?: number; focusLng?: number } | undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Login: { reason?: string; onSuccess?: () => void };
  Profile: undefined;
  Privacy: undefined;
  Terms: undefined;
  Support: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Map"
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);

  if (Platform.OS === 'web') {
    return <LandingPage />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Privacy" component={PrivacyPage} />
        <Stack.Screen name="Terms" component={TermsPage} />
        <Stack.Screen name="Support" component={SupportPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
