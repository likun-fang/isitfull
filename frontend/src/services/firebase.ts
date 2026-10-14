import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

let isGoogleSignInConfigured = false;

function configureGoogleSignIn() {
  if (!isGoogleSignInConfigured) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    isGoogleSignInConfigured = true;
  }
}

export async function signInWithGoogle(): Promise<string> {
  // Configure Google Sign-In lazily
  configureGoogleSignIn();

  // Check if device supports Google Play Services (Android)
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Get user info and tokens
  const signInResult = await GoogleSignin.signIn();

  // Get the ID token
  const idToken = signInResult.data?.idToken;
  if (!idToken) {
    throw new Error('No ID token returned from Google Sign-In');
  }

  // Create Firebase credential
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign in to Firebase
  const userCredential = await auth().signInWithCredential(googleCredential);

  // Get Firebase ID token to send to backend
  const firebaseToken = await userCredential.user.getIdToken();
  return firebaseToken;
}

export async function signInWithApple(): Promise<string> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS');
  }

  // Dynamic import to avoid Android crash
  const appleAuth = await import('@invertase/react-native-apple-authentication');
  const { appleAuthAndroid } = appleAuth;

  // Perform Apple Sign-In
  const appleAuthRequestResponse = await appleAuth.default.performRequest({
    requestedOperation: appleAuth.default.Operation.LOGIN,
    requestedScopes: [
      appleAuth.default.Scope.EMAIL,
      appleAuth.default.Scope.FULL_NAME,
    ],
  });

  // Ensure we have identity token
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identity token returned');
  }

  // Create Firebase credential
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken,
    nonce
  );

  // Sign in to Firebase
  const userCredential = await auth().signInWithCredential(appleCredential);

  // Apple only provides the name on the FIRST authorization.
  // Extract it and set it on the Firebase user profile.
  const { fullName } = appleAuthRequestResponse;
  if (fullName) {
    const displayName = [fullName.givenName, fullName.familyName]
      .filter(Boolean)
      .join(' ');
    if (displayName && !userCredential.user.displayName) {
      await userCredential.user.updateProfile({ displayName });
    }
  }

  // Get Firebase ID token to send to backend (force refresh to include updated name)
  const firebaseToken = await userCredential.user.getIdToken(true);
  return firebaseToken;
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore if not signed in with Google
  }
  await auth().signOut();
}
