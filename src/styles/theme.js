export const theme = {
  colors: {
    primary: {
      light: '#589BF3',
      main: '#3385F0',
      dark: '#2B71CC',
    },
    gradient: {
      from: '#589BF3',
      to: '#3385F0',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#9CA3AF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      gradient: 'linear-gradient(180deg, #589BF3 0%, #3385F0 100%)',
    },
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    // Dietary colors
    dietary: {
      veg: '#22C55E',
      nonVeg: '#EF4444',
      egg: '#F59E0B',
      vegan: '#10B981',
    },
  },
  // Mobile-first breakpoints (min-width)
  breakpoints: {
    xs: '320px',
    sm: '480px',
    md: '640px',
    lg: '768px',
    xl: '1024px',
    xxl: '1280px',
  },
  // Touch target sizes (minimum 44px for accessibility)
  touch: {
    min: '44px',
    default: '44px',
    large: '48px',
    xl: '56px',
  },
  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    xxl: '2rem',     // 32px
    xxxl: '3rem',    // 48px
  },
  borderRadius: {
    xs: '0.25rem',   // 4px
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    // Bottom sheet shadow
    sheet: '0 -4px 25px -5px rgba(0, 0, 0, 0.15)',
  },
  // Typography
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },
  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
    bottomNav: 900,
    bottomSheet: 1000,
  },
  // Animation durations
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },
};

// CSS custom properties generator for use in global.css
export const cssVariables = `
  --color-primary: ${theme.colors.primary.main};
  --color-primary-light: ${theme.colors.primary.light};
  --color-primary-dark: ${theme.colors.primary.dark};
  --color-text-primary: ${theme.colors.text.primary};
  --color-text-secondary: ${theme.colors.text.secondary};
  --color-text-light: ${theme.colors.text.light};
  --color-bg-primary: ${theme.colors.background.primary};
  --color-bg-secondary: ${theme.colors.background.secondary};
  --color-bg-tertiary: ${theme.colors.background.tertiary};
  --color-border: ${theme.colors.border};
  --color-error: ${theme.colors.error};
  --color-success: ${theme.colors.success};
  --color-warning: ${theme.colors.warning};
  --color-info: ${theme.colors.info};
  --color-veg: ${theme.colors.dietary.veg};
  --color-non-veg: ${theme.colors.dietary.nonVeg};
  --color-egg: ${theme.colors.dietary.egg};
  --color-vegan: ${theme.colors.dietary.vegan};
  --gradient-primary: ${theme.colors.background.gradient};
  --touch-min: ${theme.touch.min};
  --touch-default: ${theme.touch.default};
  --touch-large: ${theme.touch.large};
  --touch-xl: ${theme.touch.xl};
  --spacing-xs: ${theme.spacing.xs};
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};
  --spacing-xl: ${theme.spacing.xl};
  --spacing-xxl: ${theme.spacing.xxl};
  --spacing-xxxl: ${theme.spacing.xxxl};
  --radius-xs: ${theme.borderRadius.xs};
  --radius-sm: ${theme.borderRadius.sm};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  --radius-xl: ${theme.borderRadius.xl};
  --radius-full: ${theme.borderRadius.full};
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-xl: ${theme.shadows.xl};
  --shadow-sheet: ${theme.shadows.sheet};
  --font-xs: ${theme.fontSize.xs};
  --font-sm: ${theme.fontSize.sm};
  --font-base: ${theme.fontSize.base};
  --font-lg: ${theme.fontSize.lg};
  --font-xl: ${theme.fontSize.xl};
  --font-2xl: ${theme.fontSize['2xl']};
  --font-3xl: ${theme.fontSize['3xl']};
  --z-base: ${theme.zIndex.base};
  --z-dropdown: ${theme.zIndex.dropdown};
  --z-sticky: ${theme.zIndex.sticky};
  --z-fixed: ${theme.zIndex.fixed};
  --z-modal-backdrop: ${theme.zIndex.modalBackdrop};
  --z-modal: ${theme.zIndex.modal};
  --z-popover: ${theme.zIndex.popover};
  --z-tooltip: ${theme.zIndex.tooltip};
  --z-toast: ${theme.zIndex.toast};
  --z-bottom-nav: ${theme.zIndex.bottomNav};
  --z-bottom-sheet: ${theme.zIndex.bottomSheet};
  --animation-fast: ${theme.animation.fast};
  --animation-normal: ${theme.animation.normal};
  --animation-slow: ${theme.animation.slow};
  --animation-slowest: ${theme.animation.slowest};
  --bottom-nav-height: 64px;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
`;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${theme.breakpoints.xs})`,
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
  xxl: `@media (min-width: ${theme.breakpoints.xxl})`,
};
