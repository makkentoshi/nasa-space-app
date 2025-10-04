/**
 * Design System - resQ App
 * iOS-inspired minimalist design with bold typography
 * Two themes: Forecast (Blue) and Emergency (Green)
 */

export const designTokens = {
  // Color Palette - Forecast Mode (Blue)
  forecast: {
    primary: '#007AFF', // iOS Blue
    primaryDark: '#0051D5',
    primaryLight: '#4DA2FF',
    background: '#F2F2F7', // iOS Background
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
    },
    border: '#C6C6C8',
    accent: '#5AC8FA', // Light Blue
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
  },

  // Color Palette - Emergency Mode (Green)
  emergency: {
    primary: '#34C759', // iOS Green
    primaryDark: '#248A3D',
    primaryLight: '#5DD87C',
    background: '#F2F7F2', // Light Green tint
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
    },
    border: '#C6C6C8',
    accent: '#30D158', // Vibrant Green
    alert: '#FF3B30', // Red for disasters
    warning: '#FF9500',
    info: '#007AFF',
  },

  // Typography - Bold & Clean
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing - iOS-like
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  // Border Radius - Rounded corners
  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',
  },

  // Shadows - Subtle elevation
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Animation - Smooth transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0.0, 1, 1)',
      out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },

  // Layout
  layout: {
    containerMaxWidth: '1280px',
    bottomBarHeight: '88px', // iOS BottomBar height
    topBarHeight: '60px',
    contentPadding: '1rem',
  },
} as const;

export type DesignTokens = typeof designTokens;
export type AppMode = 'forecast' | 'emergency';
