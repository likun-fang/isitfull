import { useCallback } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useIsGuest } from '../stores';
import { RootStackParamList } from '../navigation/AppNavigator';

const PROTECTED_REASONS = {
  addFavorite: 'Sign in to save your favorite RVMs',
  viewProfile: 'Sign in to view your profile and karma',
  editReport: 'Sign in to edit your reports',
} as const;

type ProtectedAction = keyof typeof PROTECTED_REASONS;

export function useProtectedAction(action: ProtectedAction) {
  const isGuest = useIsGuest();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return useCallback(
    (callback: () => void) => {
      if (isGuest) {
        navigation.navigate('Login', {
          reason: PROTECTED_REASONS[action],
          onSuccess: callback,
        });
      } else {
        callback();
      }
    },
    [isGuest, navigation, action]
  );
}
