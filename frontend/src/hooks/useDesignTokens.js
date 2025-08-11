// ====================================================================
// USE DESIGN TOKENS HOOK
// ====================================================================
// React hook for accessing design tokens in components
// Provides both static tokens and CSS variable helpers

import { theme, getCSSVariable, cssVar, withOpacity } from '../constants/designTokens';

/**
 * Hook for accessing design tokens in React components
 * @returns {Object} Design tokens and utility functions
 */
export const useDesignTokens = () => {
  // Function to get a CSS variable value from the DOM
  const getCSSVariableValue = (tokenPath) => {
    const variableName = getCSSVariable(tokenPath);
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  };

  // Function to set a CSS variable value
  const setCSSVariable = (tokenPath, value) => {
    const variableName = getCSSVariable(tokenPath);
    document.documentElement.style.setProperty(variableName, value);
  };

  // Function to remove a CSS variable
  const removeCSSVariable = (tokenPath) => {
    const variableName = getCSSVariable(tokenPath);
    document.documentElement.style.removeProperty(variableName);
  };

  // Function to toggle between themes
  const setTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  // Function to get current theme
  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'default';
  };

  // Function to create responsive styles
  const responsive = (values) => {
    if (typeof values === 'string') return values;
    
    const breakpoints = theme.breakpoints;
    let style = {};
    
    Object.keys(values).forEach(key => {
      if (key === 'base') {
        style = { ...style, ...values[key] };
      } else if (breakpoints[key]) {
        // This would be used with CSS-in-JS libraries
        style[`@media (min-width: ${breakpoints[key]})`] = values[key];
      }
    });
    
    return style;
  };

  // Predefined component styles using tokens
  const componentStyles = {
    // Button styles
    button: {
      primary: {
        backgroundColor: cssVar('color.brand.primary'),
        color: cssVar('color.text.inverse'),
        padding: cssVar('spacing.sm') + ' ' + cssVar('spacing.lg'),
        borderRadius: cssVar('border-radius.base'),
        border: 'none',
        cursor: 'pointer',
        transition: cssVar('transition.base'),
        fontFamily: cssVar('font.primary'),
        fontWeight: cssVar('font-weight.medium'),
        ':hover': {
          backgroundColor: cssVar('color.brand.primary-light')
        }
      },
      secondary: {
        backgroundColor: 'transparent',
        color: cssVar('color.brand.primary'),
        border: '1px solid ' + cssVar('color.brand.primary'),
        padding: cssVar('spacing.sm') + ' ' + cssVar('spacing.lg'),
        borderRadius: cssVar('border-radius.base'),
        cursor: 'pointer',
        transition: cssVar('transition.base'),
        fontFamily: cssVar('font.primary'),
        fontWeight: cssVar('font-weight.medium'),
        ':hover': {
          backgroundColor: cssVar('color.brand.primary'),
          color: cssVar('color.text.inverse')
        }
      }
    },

    // Card styles
    card: {
      default: {
        backgroundColor: cssVar('color.bg.tertiary'),
        border: '1px solid ' + cssVar('color.border.light'),
        borderRadius: cssVar('border-radius.lg'),
        padding: cssVar('spacing.lg'),
        boxShadow: cssVar('elevation.base'),
        transition: cssVar('transition.base'),
        ':hover': {
          boxShadow: cssVar('elevation.md')
        }
      },
      vocabulary: {
        backgroundColor: cssVar('color.bg.primary'),
        borderRadius: cssVar('border-radius.md'),
        padding: cssVar('spacing.lg'),
        boxShadow: cssVar('elevation.base')
      }
    },

    // Input styles
    input: {
      default: {
        backgroundColor: cssVar('color.bg.input'),
        border: '1px solid ' + cssVar('color.border.light'),
        borderRadius: cssVar('border-radius.base'),
        padding: cssVar('spacing.sm') + ' ' + cssVar('spacing.md'),
        color: cssVar('color.text.primary'),
        fontFamily: cssVar('font.primary'),
        transition: cssVar('transition.base'),
        ':focus': {
          outline: 'none',
          border: '2px solid ' + cssVar('color.brand.primary'),
          boxShadow: '0 0 0 3px ' + withOpacity(theme.colors.brand.primary, 0.1)
        }
      },
      error: {
        border: '1px solid ' + cssVar('color.error.primary'),
        backgroundColor: cssVar('color.error.bg')
      },
      success: {
        border: '1px solid ' + cssVar('color.success.primary'),
        backgroundColor: cssVar('color.success.bg')
      }
    }
  };

  return {
    // Static theme object
    theme,
    
    // Token access utilities
    getCSSVariable,
    cssVar,
    getCSSVariableValue,
    setCSSVariable,
    removeCSSVariable,
    
    // Theme management
    setTheme,
    getCurrentTheme,
    
    // Styling utilities
    withOpacity,
    responsive,
    componentStyles,
    
    // Direct access to token categories
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    borderRadius: theme.borderRadius,
    elevation: theme.elevation,
    zIndex: theme.zIndex,
    transitions: theme.transitions,
    breakpoints: theme.breakpoints,
    components: theme.components
  };
};

// Named exports for specific token categories
export const useColors = () => {
  const { colors } = useDesignTokens();
  return colors;
};

export const useSpacing = () => {
  const { spacing } = useDesignTokens();
  return spacing;
};

export const useTypography = () => {
  const { typography } = useDesignTokens();
  return typography;
};

export const useComponents = () => {
  const { components } = useDesignTokens();
  return components;
};

// Theme management hook
export const useTheme = () => {
  const { setTheme, getCurrentTheme, setCSSVariable, getCSSVariableValue } = useDesignTokens();
  
  return {
    setTheme,
    getCurrentTheme,
    setCSSVariable,
    getCSSVariableValue,
    
    // Predefined theme setters
    setLightTheme: () => setTheme('default'),
    setDarkTheme: () => setTheme('dark'),
    setHighContrastTheme: () => setTheme('high-contrast'),
    
    // Theme state checkers
    isDarkTheme: () => getCurrentTheme() === 'dark',
    isHighContrastTheme: () => getCurrentTheme() === 'high-contrast'
  };
};

export default useDesignTokens;