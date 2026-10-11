export const darkColors = {
  background: '#0D0D12',
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  purple: '#7C3AED',
  purpleLight: '#8B5CF6',
  accent: '#A78BFA',
  text: '#FFFFFF',
  text70: 'rgba(255,255,255,0.70)',
  text40: 'rgba(255,255,255,0.40)',
  text20: 'rgba(255,255,255,0.20)',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  border: 'rgba(255,255,255,0.08)',
};

export const lightColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceElevated: '#F3F4F6',
  purple: '#7C3AED',
  purpleLight: '#8B5CF6',
  accent: '#A78BFA',
  text: '#111827',
  text70: 'rgba(17,24,39,0.70)',
  text40: 'rgba(17,24,39,0.40)',
  text20: 'rgba(17,24,39,0.20)',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
  border: 'rgba(0,0,0,0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const font = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
};

export const theme = {
  colors: darkColors,
  spacing,
  radius,
  font,
  fontSize,
};

export type Theme = typeof theme;
