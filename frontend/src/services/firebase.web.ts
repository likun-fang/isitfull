// Web stub — Firebase auth is not used on the web landing page.
// Metro automatically resolves .web.ts over .ts for web builds.

export async function signInWithGoogle(): Promise<string> {
  throw new Error('Google Sign-In is not available on web')
}

export async function signInWithApple(): Promise<string> {
  throw new Error('Apple Sign-In is not available on web')
}

export async function signOut(): Promise<void> {
  // no-op on web
}
