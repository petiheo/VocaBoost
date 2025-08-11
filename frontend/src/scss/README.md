# VocaBoost Design Token System

## Overview

VocaBoost now uses a centralized design token system to ensure consistency across the application. This system provides:

- **Consistent styling** across all components
- **Easy theming** and customization
- **Better maintainability** with centralized values
- **Accessibility improvements** built-in
- **Future-ready** for dark mode and other themes

## Architecture

```
src/scss/
├── _DesignTokens.scss      # Core design tokens (SCSS variables)
├── _ComponentTokens.scss   # Component-specific tokens
├── _CSSVariables.scss      # CSS custom properties (runtime accessible)
├── main.scss              # Updated with token imports
└── README.md             # This documentation
```

## 🎨 Design Token Files

### 1. `_DesignTokens.scss`
Core design system foundation with:
- **Colors**: Brand, background, text, accent, status colors
- **Spacing**: 8px grid system (xs to 4xl)
- **Typography**: Font families, sizes, weights, line heights
- **Border Radius**: Consistent corner radius scale
- **Elevation**: Box shadow system
- **Z-index**: Layering system
- **Breakpoints**: Responsive design breakpoints
- **Transitions**: Animation timing

### 2. `_ComponentTokens.scss`
Component-specific tokens built on core tokens:
- **Buttons**: Primary, secondary, AI button styles
- **Cards**: Word cards, vocabulary cards, classroom cards
- **Forms**: Input fields, search bars, validation states
- **Navigation**: Header, sidebar, dropdown menus
- **Modals**: Overlays, confirm dialogs
- **Toast Notifications**: Success, error, warning, info
- **Skeleton Loading**: Theme variants
- **Tables & Pagination**: Data display components

### 3. `_CSSVariables.scss`
CSS custom properties for runtime theming:
- Runtime-accessible variables using `var(--vb-*)`
- Theme switching support (dark mode ready)
- High contrast accessibility theme
- Utility classes for common patterns

## 🚀 Usage Examples

### In SCSS Files

```scss
// Import design tokens
@use "DesignTokens" as tokens;
@use "ComponentTokens" as components;

.my-component {
  // Using core tokens
  background: tokens.$color-bg-primary;
  color: tokens.$color-text-primary;
  padding: tokens.$spacing-lg;
  border-radius: tokens.$border-radius-lg;
  
  // Using component tokens
  background: components.$card-bg;
  padding: components.$card-padding;
  box-shadow: components.$card-elevation;
}

.my-button {
  background: components.$btn-primary-bg;
  color: components.$btn-primary-color;
  padding: components.$btn-primary-padding;
  border-radius: components.$btn-primary-border-radius;
  
  &:hover {
    background: components.$btn-primary-hover-bg;
  }
}
```

### Using CSS Variables

```scss
.modern-component {
  background: var(--vb-color-bg-primary);
  color: var(--vb-color-text-primary);
  padding: var(--vb-spacing-lg);
  border-radius: var(--vb-border-radius-lg);
  box-shadow: var(--vb-elevation-base);
  transition: var(--vb-transition-base);
}

// Utility classes are available
.my-element {
  @extend .vb-bg-primary;
  @extend .vb-text-secondary;
  @extend .vb-p-lg;
  @extend .vb-rounded-lg;
  @extend .vb-elevation-md;
}
```

### In JavaScript/React Components

```javascript
import { theme, colors, spacing, components } from '../constants/designTokens';

// Using individual tokens
const ButtonComponent = () => (
  <button 
    style={{
      backgroundColor: colors.brand.primary,
      color: colors.text.inverse,
      padding: spacing.lg,
      borderRadius: '8px'
    }}
  >
    Click me
  </button>
);

// Using component tokens
const CardComponent = () => (
  <div style={{
    ...components.card,
    margin: spacing.md
  }}>
    Content here
  </div>
);

// Using CSS variables (recommended for runtime theming)
const DynamicComponent = () => (
  <div 
    style={{
      backgroundColor: 'var(--vb-color-bg-primary)',
      color: 'var(--vb-color-text-primary)',
      padding: 'var(--vb-spacing-lg)'
    }}
  >
    Themeable content
  </div>
);
```

## 🎯 Token Categories

### Colors
```scss
// Brand Colors
$color-brand-primary: #352d24;
$color-brand-primary-light: #2a1e17;
$color-brand-primary-dark: #1e150f;

// Background Colors  
$color-bg-primary: #fffcf7;      // Main cream background
$color-bg-secondary: #fdfaf5;    // Secondary background
$color-bg-tertiary: #fff;        // Pure white

// Status Colors
$color-success-primary: #3bc042;
$color-error-primary: #c03b3b;
$color-warning-primary: #f59e0b;
```

### Spacing (8px Grid System)
```scss
$spacing-xs: 0.25rem;    // 4px
$spacing-sm: 0.5rem;     // 8px
$spacing-md: 1rem;       // 16px
$spacing-lg: 1.5rem;     // 24px
$spacing-xl: 2rem;       // 32px
$spacing-2xl: 3rem;      // 48px
```

### Typography
```scss
$font-primary: "Inria Sans", sans-serif;    // Main UI font
$font-display: "Lalezar", sans-serif;       // Headers
$font-body: "Jost", sans-serif;             // Body text
$font-ui: "Inter", sans-serif;              // UI elements
```

## 🌙 Theme Support

The system is ready for multiple themes:

```scss
// Default theme (current)
:root {
  --vb-color-bg-primary: #fffcf7;
  --vb-color-text-primary: #352d24;
}

// Dark theme (ready to implement)
[data-theme="dark"] {
  --vb-color-bg-primary: #1a1a1a;
  --vb-color-text-primary: #ffffff;
}

// High contrast theme (accessibility)
[data-theme="high-contrast"] {
  --vb-color-text-primary: #000000;
  --vb-color-bg-primary: #ffffff;
  --vb-color-border-light: #000000;
}
```

## ♿ Accessibility Features

Built-in accessibility improvements:

```scss
// Focus styles for better keyboard navigation
*:focus {
  outline: 2px solid var(--vb-color-brand-primary);
  outline-offset: 2px;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📱 Responsive Design

Consistent breakpoints for responsive design:

```scss
$breakpoint-sm: 576px;   // Small devices
$breakpoint-md: 768px;   // Tablets  
$breakpoint-lg: 992px;   // Desktops
$breakpoint-xl: 1200px;  // Large desktops
```

## 🔧 Migration Guide

### Converting Existing Styles

**Before:**
```scss
.old-component {
  background: #fffcf7;
  color: #352d24;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**After:**
```scss
@use "ComponentTokens" as components;

.new-component {
  background: components.$card-bg;
  color: var(--vb-color-text-primary);
  padding: components.$card-padding;
  border-radius: components.$card-border-radius;
  box-shadow: components.$card-elevation;
}
```

### Updating Component Files

1. Add token imports at the top:
   ```scss
   @use "../DesignTokens" as tokens;
   @use "../ComponentTokens" as components;
   ```

2. Replace hard-coded values with tokens:
   ```scss
   // Old
   background: #352d24;
   
   // New  
   background: tokens.$color-brand-primary;
   // or
   background: var(--vb-color-brand-primary);
   ```

## 🎨 Skeleton Themes

Special skeleton loading themes for different contexts:

```scss
$skeleton-classroom-base: #f1ede4;
$skeleton-cream-base: #FFFCF7;  
$skeleton-vocab-card-base: #F9F3E4;
```

## 🚦 Status Indicators

Consistent status colors across the app:

```scss
$status-active-bg: tokens.$color-success-primary;
$status-pending-bg: tokens.$color-warning-primary;
$status-inactive-bg: tokens.$color-text-disabled;
```

## 📦 Component Token Examples

### Button Tokens
```scss
$btn-primary-bg: tokens.$color-brand-primary;
$btn-primary-color: tokens.$color-text-inverse;
$btn-primary-hover-bg: tokens.$color-brand-primary-light;
$btn-primary-padding: tokens.$spacing-sm tokens.$spacing-lg;
```

### Card Tokens  
```scss
$card-bg: tokens.$color-bg-tertiary;
$card-border: 1px solid tokens.$color-border-light;
$card-border-radius: tokens.$border-radius-lg;
$card-padding: tokens.$spacing-card-padding;
$card-elevation: tokens.$elevation-base;
```

### Input Tokens
```scss
$input-bg: tokens.$color-bg-input;
$input-border: 1px solid tokens.$color-border-light;
$input-border-focus: 2px solid tokens.$color-brand-primary;
$input-error-border: 1px solid tokens.$color-error-primary;
```

## 🔗 Integration with Existing Components

The design token system integrates seamlessly with existing VocaBoost components:

- **Toast notifications** now use consistent theming
- **Skeleton loading** has themed variants
- **Form inputs** have consistent validation states
- **Cards** maintain brand consistency
- **Navigation** follows the design system

## 🎯 Best Practices

1. **Always use tokens** instead of hard-coded values
2. **Prefer CSS variables** for runtime theming
3. **Use component tokens** for complex component styling
4. **Follow the spacing grid** (multiples of 8px)
5. **Use semantic color names** (primary, secondary, etc.)
6. **Test with high contrast** and dark themes in mind

## 🔮 Future Enhancements

The design token system is ready for:
- **Dark mode implementation**
- **Custom brand themes** 
- **User preference themes**
- **High contrast accessibility themes**
- **RTL language support**
- **Component variants** expansion

---

This design token system provides a solid foundation for VocaBoost's UI consistency and future theming capabilities while maintaining the existing brand identity.