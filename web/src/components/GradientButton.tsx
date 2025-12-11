import { type CSSProperties } from 'react';
import { theme, createGradient } from '../styles/theme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    gradient?: string[];
    loading?: boolean;
    disabled?: boolean;
    style?: CSSProperties;
    className?: string;
}

export function GradientButton({
    title,
    onPress,
    gradient = theme.colors.gradientPrimary,
    loading = false,
    disabled = false,
    style,
    className = '',
}: GradientButtonProps) {
    const buttonStyles: CSSProperties = {
        background: createGradient(gradient),
        border: 'none',
        borderRadius: theme.borderRadius.md,
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
        color: theme.colors.text,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: `all ${theme.animation.normal}`,
        boxShadow: theme.shadows.md,
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        width: '100%',
        ...style,
    };

    return (
        <button
            className={`gradient-button ${className}`}
            style={buttonStyles}
            onClick={onPress}
            disabled={disabled || loading}
            onMouseEnter={(e) => {
                if (!disabled && !loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.shadows.lg;
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.md;
                }
            }}
        >
            {loading ? (
                <>
                    <span className="spinner" style={spinnerStyle}></span>
                    Loading...
                </>
            ) : (
                title
            )}
        </button>
    );
}

const spinnerStyle: CSSProperties = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
};

// Add spinner animation to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
