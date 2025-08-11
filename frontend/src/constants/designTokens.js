// ====================================================================
// VOCABOOST DESIGN TOKENS - JavaScript Constants
// ====================================================================
// JavaScript exports of design tokens for use in React components
// These should match the values in _DesignTokens.scss and _CSSVariables.scss

// ====================================================================
// COLOR TOKENS
// ====================================================================

export const colors = {
  // Brand Colors
  brand: {
    primary: '#352d24',
    primaryLight: '#2a1e17',
    primaryDark: '#1e150f'
  },

  // Background Colors
  background: {
    primary: '#fffcf7',
    secondary: '#fdfaf5',
    tertiary: '#fff',
    card: '#f2f2f2',
    input: '#fff4f4'
  },

  // Text Colors
  text: {
    primary: '#352d24',
    secondary: '#2a1e17',
    tertiary: '#757575',
    disabled: '#999',
    inverse: '#fff3df'
  },

  // Accent Colors
  accent: {
    yellow: '#ffeab6',
    orange: '#d5962c',
    gold: '#f7d99d'
  },

  // Status Colors
  status: {
    success: {
      primary: '#3bc042',
      background: '#e0ffe1'
    },
    error: {
      primary: '#c03b3b',
      secondary: '#a30000',
      background: '#ffe5e5'
    },
    warning: {
      primary: '#f59e0b',
      background: '#fef3c7'
    },
    info: {
      primary: '#352d24',
      background: '#fff3df'
    }
  },

  // Border Colors
  border: {
    light: '#eee',
    medium: '#e2e2e2',
    dark: '#ccc'
  }
};

// ====================================================================
// SPACING TOKENS
// ====================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px

  // Component-specific spacing
  card: {
    padding: '1.5rem'
  },
  section: {
    margin: '3rem'
  },
  element: {
    gap: '1rem'
  }
};

// ====================================================================
// TYPOGRAPHY TOKENS
// ====================================================================

export const typography = {
  // Font Families
  fonts: {
    primary: '"Inria Sans", sans-serif',
    display: '"Lalezar", sans-serif',
    body: '"Jost", sans-serif',
    ui: '"Inter", sans-serif'
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'   // 36px
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    base: 1.5,
    relaxed: 1.75
  }
};

// ====================================================================
// BORDER RADIUS TOKENS
// ====================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '1rem',        // 16px
  full: '50%'
};

// ====================================================================
// ELEVATION TOKENS (Box Shadows)
// ====================================================================

export const elevation = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  base: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  toast: '0 4px 12px rgba(0, 0, 0, 0.15)'
};

// ====================================================================
// Z-INDEX TOKENS
// ====================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  header: 100,
  overlay: 1000,
  modal: 10000,
  toast: 11000,
  tooltip: 12000
};

// ====================================================================
// TRANSITION TOKENS
// ====================================================================

export const transitions = {
  fast: '0.15s ease-in-out',
  base: '0.2s ease-in-out',
  slow: '0.3s ease-in-out'
};

// ====================================================================
// BREAKPOINTS
// ====================================================================

export const breakpoints = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1400px'
};

// ====================================================================
// COMPONENT-SPECIFIC TOKENS
// ====================================================================

export const components = {
  // Button Tokens
  button: {
    primary: {
      background: colors.brand.primary,
      color: colors.text.inverse,
      hoverBackground: colors.brand.primaryLight,
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: borderRadius.base
    },
    secondary: {
      background: 'transparent',
      color: colors.brand.primary,
      border: `1px solid ${colors.brand.primary}`,
      hoverBackground: colors.brand.primary,
      hoverColor: colors.text.inverse
    },
    ai: {
      background: colors.accent.orange,
      color: colors.text.inverse,
      borderRadius: borderRadius.base
    }
  },

  // Card Tokens
  card: {
    background: colors.background.tertiary,
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: elevation.base,
    hoverElevation: elevation.md
  },

  // Input Tokens
  input: {
    background: colors.background.input,
    border: `1px solid ${colors.border.light}`,
    focusBorder: `2px solid ${colors.brand.primary}`,
    borderRadius: borderRadius.base,
    padding: `${spacing.sm} ${spacing.md}`,
    color: colors.text.primary,
    placeholderColor: colors.text.disabled
  },

  // Toast Tokens
  toast: {
    success: {
      background: colors.status.success.primary,
      color: colors.status.success.background
    },
    error: {
      background: colors.status.error.primary,
      color: colors.status.error.background
    },
    warning: {
      background: colors.status.warning.primary,
      color: colors.status.warning.background
    },
    info: {
      background: colors.status.info.primary,
      color: colors.status.info.background
    }
  }
};

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

// Function to get CSS variable name for a token
export const getCSSVariable = (tokenPath) => {
  const pathArray = tokenPath.split('.');
  return `--vb-${pathArray.join('-')}`;
};

// Function to create CSS variable reference
export const cssVar = (tokenPath) => {
  return `var(${getCSSVariable(tokenPath)})`;
};

// Function to get color with opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Function to get responsive value based on breakpoint
export const responsive = (values, breakpoints = breakpoints) => {
  if (typeof values === 'string') return values;
  
  const mediaQueries = Object.keys(values).map(key => {
    if (key === 'base') return values[key];
    return `@media (min-width: ${breakpoints[key]}) { ${values[key]} }`;
  });
  
  return mediaQueries.join(' ');
};

// ====================================================================
// THEME CONFIGURATION
// ====================================================================

// Default theme configuration
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  elevation,
  zIndex,
  transitions,
  breakpoints,
  components
};

// Export default theme
export default theme;