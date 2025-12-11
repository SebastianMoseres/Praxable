import { type ReactNode, type CSSProperties } from 'react';
import { theme } from '../styles/theme';

interface GlassCardProps {
    children: ReactNode;
    variant?: 'default' | 'strong';
    style?: CSSProperties;
    className?: string;
}

export function GlassCard({ children, variant = 'default', style, className = '' }: GlassCardProps) {
    const baseStyles: CSSProperties = {
        background: variant === 'strong' ? theme.colors.glassHighlight : theme.colors.glass,
        border: `1px solid ${theme.colors.glassBorder}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: variant === 'strong' ? theme.shadows.lg : theme.shadows.md,
        ...style,
    };

    return (
        <div className={`glass-card ${className}`} style={baseStyles}>
            {children}
        </div>
    );
}
