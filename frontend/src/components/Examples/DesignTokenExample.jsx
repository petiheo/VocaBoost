// ====================================================================
// DESIGN TOKEN USAGE EXAMPLE COMPONENT
// ====================================================================
// This component demonstrates how to use the new design token system
// Remove this file once the system is integrated into existing components

import React from 'react';
import { useDesignTokens, useTheme } from '../../hooks/useDesignTokens';

const DesignTokenExample = () => {
  const { 
    colors, 
    spacing, 
    typography, 
    componentStyles, 
    cssVar,
    withOpacity 
  } = useDesignTokens();
  
  const { setTheme, getCurrentTheme } = useTheme();

  // Example using CSS variables (recommended approach)
  const cardStyleWithCSSVars = {
    backgroundColor: 'var(--vb-color-bg-tertiary)',
    border: '1px solid var(--vb-color-border-light)',
    borderRadius: 'var(--vb-border-radius-lg)',
    padding: 'var(--vb-spacing-lg)',
    boxShadow: 'var(--vb-elevation-base)',
    marginBottom: 'var(--vb-spacing-md)',
    transition: 'var(--vb-transition-base)'
  };

  // Example using JavaScript tokens
  const cardStyleWithJSTokens = {
    backgroundColor: colors.background.tertiary,
    border: `1px solid ${colors.border.light}`,
    borderRadius: '8px',
    padding: spacing.lg,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: spacing.md,
    color: colors.text.primary
  };

  // Example using component styles from the hook
  const buttonStyle = {
    ...componentStyles.button.primary,
    marginRight: spacing.sm
  };

  const secondaryButtonStyle = {
    ...componentStyles.button.secondary,
    marginRight: spacing.sm
  };

  return (
    <div style={{ padding: spacing.xl }}>
      <h1 style={{ 
        fontFamily: typography.fonts.display,
        fontSize: typography.fontSize['2xl'],
        color: colors.brand.primary,
        marginBottom: spacing.lg
      }}>
        Design Token System Examples
      </h1>

      {/* Theme Controls */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Theme Controls
        </h3>
        <p style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-secondary)' }}>
          Current theme: {getCurrentTheme()}
        </p>
        <button 
          style={buttonStyle}
          onClick={() => setTheme('default')}
        >
          Light Theme
        </button>
        <button 
          style={secondaryButtonStyle}
          onClick={() => setTheme('dark')}
        >
          Dark Theme
        </button>
        <button 
          style={secondaryButtonStyle}
          onClick={() => setTheme('high-contrast')}
        >
          High Contrast
        </button>
      </div>

      {/* Color Examples */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Color System
        </h3>
        <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
          {Object.entries(colors.brand).map(([key, color]) => (
            <div key={key} style={{
              backgroundColor: color,
              color: colors.text.inverse,
              padding: spacing.sm,
              borderRadius: '4px',
              minWidth: '100px',
              textAlign: 'center',
              fontSize: typography.fontSize.sm
            }}>
              {key}
            </div>
          ))}
        </div>
      </div>

      {/* Status Colors */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Status Colors
        </h3>
        <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: colors.status.success.background,
            color: colors.status.success.primary,
            padding: spacing.md,
            borderRadius: '8px',
            border: `2px solid ${colors.status.success.primary}`
          }}>
            Success State
          </div>
          <div style={{
            backgroundColor: colors.status.error.background,
            color: colors.status.error.primary,
            padding: spacing.md,
            borderRadius: '8px',
            border: `2px solid ${colors.status.error.primary}`
          }}>
            Error State
          </div>
          <div style={{
            backgroundColor: colors.status.warning.background,
            color: colors.status.warning.primary,
            padding: spacing.md,
            borderRadius: '8px',
            border: `2px solid ${colors.status.warning.primary}`
          }}>
            Warning State
          </div>
        </div>
      </div>

      {/* Spacing Examples */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Spacing System
        </h3>
        <div>
          {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(size => (
            <div key={size} style={{
              backgroundColor: withOpacity(colors.brand.primary, 0.2),
              marginBottom: spacing.sm,
              padding: spacing[size],
              border: `1px solid ${colors.brand.primary}`,
              borderRadius: '4px'
            }}>
              {size}: {spacing[size]} padding
            </div>
          ))}
        </div>
      </div>

      {/* Typography Examples */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Typography System
        </h3>
        <div style={{
          fontFamily: typography.fonts.display,
          fontSize: typography.fontSize['3xl'],
          marginBottom: spacing.sm,
          color: colors.brand.primary
        }}>
          Display Font (Lalezar)
        </div>
        <div style={{
          fontFamily: typography.fonts.primary,
          fontSize: typography.fontSize.lg,
          marginBottom: spacing.sm,
          color: colors.text.primary
        }}>
          Primary Font (Inria Sans)
        </div>
        <div style={{
          fontFamily: typography.fonts.body,
          fontSize: typography.fontSize.base,
          marginBottom: spacing.sm,
          color: colors.text.secondary
        }}>
          Body Font (Jost)
        </div>
        <div style={{
          fontFamily: typography.fonts.ui,
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary
        }}>
          UI Font (Inter)
        </div>
      </div>

      {/* Form Examples */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          Form Elements
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <input 
            type="text" 
            placeholder="Default input using CSS variables"
            style={{
              backgroundColor: 'var(--vb-color-bg-input)',
              border: '1px solid var(--vb-color-border-light)',
              borderRadius: 'var(--vb-border-radius-base)',
              padding: 'var(--vb-spacing-sm) var(--vb-spacing-md)',
              color: 'var(--vb-color-text-primary)',
              fontFamily: 'var(--vb-font-primary)',
              fontSize: 'var(--vb-font-size-base)'
            }}
          />
          <input 
            type="text" 
            placeholder="Error state input"
            style={{
              ...componentStyles.input.default,
              ...componentStyles.input.error
            }}
          />
          <input 
            type="text" 
            placeholder="Success state input"
            style={{
              ...componentStyles.input.default,
              ...componentStyles.input.success
            }}
          />
        </div>
      </div>

      {/* CSS Variable Utilities */}
      <div style={cardStyleWithCSSVars}>
        <h3 style={{ marginBottom: spacing.md, color: 'var(--vb-color-text-primary)' }}>
          CSS Variable Utilities
        </h3>
        <div className="vb-bg-primary vb-p-md vb-rounded-lg vb-elevation-sm" 
             style={{ marginBottom: spacing.sm }}>
          Using utility classes: .vb-bg-primary .vb-p-md .vb-rounded-lg .vb-elevation-sm
        </div>
        <div style={{
          backgroundColor: cssVar('color.accent.gold'),
          color: cssVar('color.text.primary'),
          padding: cssVar('spacing.md'),
          borderRadius: cssVar('border-radius.lg'),
          boxShadow: cssVar('elevation.base')
        }}>
          Using cssVar() helper function for token access
        </div>
      </div>

      <div style={{ 
        marginTop: spacing.xl, 
        padding: spacing.lg,
        backgroundColor: withOpacity(colors.status.info.primary, 0.1),
        border: `1px solid ${colors.status.info.primary}`,
        borderRadius: '8px'
      }}>
        <h4 style={{ color: colors.status.info.primary, marginBottom: spacing.sm }}>
          💡 Usage Recommendations
        </h4>
        <ul style={{ color: colors.text.secondary, lineHeight: typography.lineHeight.relaxed }}>
          <li><strong>Use CSS variables</strong> (var(--vb-*)) for runtime theming</li>
          <li><strong>Use SCSS tokens</strong> for build-time optimizations</li>
          <li><strong>Use component styles</strong> from the hook for consistent components</li>
          <li><strong>Use utility classes</strong> for common patterns</li>
          <li><strong>Test with different themes</strong> to ensure accessibility</li>
        </ul>
      </div>
    </div>
  );
};

export default DesignTokenExample;