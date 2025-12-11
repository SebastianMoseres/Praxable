// Glassmorphism Dark Theme Configuration
// Ported from mobile app with web-specific optimizations

export const theme = {
    // Color Palette
    colors: {
        // Backgrounds
        background: '#0A0E1A',
        backgroundSecondary: '#111827',

        // Glassmorphic overlays
        glass: 'rgba(255, 255, 255, 0.08)',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
        glassHighlight: 'rgba(255, 255, 255, 0.2)',

        // Gradients (arrays for CSS linear-gradient)
        gradientPrimary: ['#667eea', '#764ba2'],
        gradientSecondary: ['#f093fb', '#f5576c'],
        gradientSuccess: ['#11998e', '#38ef7d'],
        gradientInfo: ['#4facfe', '#00f2fe'],
        gradientWarning: ['#fa709a', '#fee140'],

        // Accent colors
        primary: '#667eea',
        secondary: '#f093fb',
        success: '#38ef7d',
        warning: '#fee140',
        danger: '#f5576c',
        info: '#4facfe',

        // Text
        text: '#ffffff',
        textSecondary: '#9ca3af',
        textMuted: '#6b7280',

        // Status
        complete: '#10b981',
        incomplete: '#fbbf24',
        pending: '#6366f1',
    },

    // Typography
    typography: {
        fontFamily: {
            regular: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            medium: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            semibold: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            bold: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        sizes: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '30px',
            '4xl': '36px',
            '5xl': '48px',
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        '3xl': '48px',
    },

    // Border Radius
    borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
    },

    // Shadows (for glassmorphism)
    shadows: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.25)',
        md: '0 4px 8px rgba(0, 0, 0, 0.3)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.35)',
        glow: '0 4px 20px rgba(102, 126, 234, 0.5)',
    },

    // Animation durations
    animation: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
    },
};

// Helper to create gradient string
export const createGradient = (colors: string[]) => {
    return `linear-gradient(135deg, ${colors.join(', ')})`;
};

// Type definitions
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
