import React from 'react';
import LandingPage from '../screens/LandingPage';
import PrivacyPageWeb from '../screens/PrivacyPage.web';
import TermsPageWeb from '../screens/TermsPage.web';
import SupportPageWeb from '../screens/SupportPage.web';
import DownloadsPageWeb from '../screens/DownloadsPage.web';

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
  const raw = typeof window !== 'undefined' ? window.location.pathname : '/';
  const pathname = raw.replace(/\/+$/, '') || '/';

  if (pathname === '/privacy') {
    return <PrivacyPageWeb />;
  }
  if (pathname === '/terms') {
    return <TermsPageWeb />;
  }
  if (pathname === '/support') {
    return <SupportPageWeb />;
  }
  if (pathname === '/downloads') {
    return <DownloadsPageWeb />;
  }

  return <LandingPage />;
}
