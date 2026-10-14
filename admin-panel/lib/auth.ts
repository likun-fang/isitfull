const TOKEN_KEY = 'admin_token'
const DISPLAY_NAME_KEY = 'admin_display_name'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, displayName: string | null): void {
  localStorage.setItem(TOKEN_KEY, token)
  if (displayName) {
    localStorage.setItem(DISPLAY_NAME_KEY, displayName)
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(DISPLAY_NAME_KEY)
}

export function getDisplayName(): string {
  if (typeof window === 'undefined') return 'Admin'
  return localStorage.getItem(DISPLAY_NAME_KEY) || 'Admin'
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
