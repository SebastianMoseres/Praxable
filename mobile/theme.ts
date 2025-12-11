import { StyleSheet } from 'react-native';

// Glassmorphism Dark Theme Configuration
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

        // Gradients
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
            regular: 'System',
            medium: 'System',
            semibold: 'System',
            bold: 'System',
        },
        sizes: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
            '5xl': 48,
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 40,
        '3xl': 48,
    },

    // Border Radius
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        full: 9999,
    },

    // Shadows (for glassmorphism)
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
        },
        glow: {
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 6,
        },
    },

    // Glassmorphism styles
    glass: {
        backdrop: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
        },
        strong: {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
        },
    },

    // Animation durations (in ms)
    animation: {
        fast: 150,
        normal: 250,
        slow: 400,
    },
};

// Common glass card styles
export const glassStyles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.md,
    },
    cardStrong: {
        backgroundColor: theme.colors.glassHighlight,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.lg,
    },
});

// Type definitions
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
