/**
 * Eco-Return Ireland Design System
 *
 * Aesthetic: Nordic Industrial Eco
 * - Clean, functional Scandinavian minimalism
 * - Sustainable/eco-conscious color palette
 * - Irish landscape-inspired green accent
 * - Brutalist-functional typography
 */

export const colors = {
  // Primary - Irish Eco Green
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main brand color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Neutral - Warm grays with slight green undertone
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAF9',
    100: '#F1F5F3',
    200: '#E2E8E5',
    300: '#CBD5D0',
    400: '#9CA8A2',
    500: '#6B7A73',
    600: '#4A5650',
    700: '#374240',
    800: '#1F2A27',
    900: '#0F1614',
  },

  // Status colors
  status: {
    available: '#10B981',
    busy: '#F59E0B',
    broken: '#EF4444',
    unknown: '#9CA3AF',
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Accent - for highlights and CTAs
  accent: {
    coral: '#F97316',
    teal: '#14B8A6',
  },
} as const;

// Alias for clarity
export const lightColors = colors;

// Dark mode colors — neutral scale is semantically inverted
export const darkColors = {
  primary: {
    50: '#0D2818',   // very subtle dark green tint (icon bg, banners)
    100: '#0F3321',
    200: '#134A2E',
    300: '#1A6B42',
    400: '#22916B',
    500: '#10B981', // Main brand color (same)
    600: '#34D399', // brighter for dark bg readability
    700: '#6EE7B7',
    800: '#A7F3D0',
    900: '#D1FAE5',
  },
  neutral: {
    0: '#1A1F1D',
    50: '#1F2623',
    100: '#253029',
    200: '#2E3B34',
    300: '#3D4F46',
    400: '#6B7A73',
    500: '#9CA8A2',
    600: '#CBD5D0',
    700: '#E2E8E5',
    800: '#F1F5F3',
    900: '#F8FAF9',
  },
  status: { ...colors.status },
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  accent: { ...colors.accent },
} as const;

export type Colors = {
  readonly primary: { readonly [K in keyof typeof colors.primary]: string };
  readonly neutral: { readonly [K in keyof typeof colors.neutral]: string };
  readonly status: { readonly [K in keyof typeof colors.status]: string };
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
  readonly accent: { readonly [K in keyof typeof colors.accent]: string };
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const typography = {
  // Using system fonts for performance, styled distinctively
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Tab bar specific
export const tabBar = {
  height: 64,
  iconSize: 24,
  labelSize: 11,
  activeColor: colors.primary[600],
  inactiveColor: colors.neutral[400],
  backgroundColor: colors.neutral[0],
  borderColor: colors.neutral[200],
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  tabBar,
} as const;

export type Theme = typeof theme;
