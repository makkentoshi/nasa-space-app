// Design tokens inspired by the attached marketplace screenshots.
// Use these tokens across components to reproduce typography, spacing,
// colors, shadows, radii and icon sizing so the app UI matches the look.
// Notes: for fonts we recommend using an open-source alternative (Google Fonts)
// that visually matches the screenshots (Poppins / Inter). Do not embed
// proprietary fonts without a license.

export const fonts = {
  ui: "'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  headings: "'Poppins', 'Inter', system-ui",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto",
};

export const fontSizes = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '22px',
  '2xl': '28px',
};

export const colors = {
  // primary app green (buttons, CTA)
  primary: '#34C38F',
  primaryHover: '#2EA776',
  // secondary (blue buttons e.g. Google)
  blue: '#4A90E2',
  indigo: '#5B6CF6',
  // neutrals
  black: '#0B1220',
  gray900: '#14171A',
  gray800: '#2B2F33',
  gray700: '#4B5563',
  gray500: '#9AA0A6',
  gray300: '#E6E9EE',
  gray200: '#F3F5F7',
  white: '#FFFFFF',
  // subtle success / warning
  success: '#23C66B',
  danger: '#FF5C5C',
};

export const radii = {
  sm: '6px',
  md: '12px',
  lg: '18px',
  pill: '9999px',
};

export const shadows = {
  card: '0 10px 30px rgba(12, 16, 24, 0.08)',
  elevated: '0 18px 40px rgba(12, 16, 24, 0.12)',
  insetSoft: 'inset 0 -1px 0 rgba(255,255,255,0.02)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '28px',
};

export const icons = {
  sm: 16,
  md: 20,
  lg: 28,
  xl: 36,
};

// Utility for building CSS-friendly values where needed
export function px(n: number) {
  return `${n}px`;
}

const tokens = {
  fonts,
  fontSizes,
  colors,
  radii,
  shadows,
  spacing,
  icons,
  px,
};

export default tokens;