import React from 'react';
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
  Downloads: undefined;
};

export function AppNavigator() {
  return <LandingPage />;
}
