import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api } from '../services/api';
import type { CoreValue } from '../types';
import { theme } from '../styles/theme';
import { type CSSProperties } from 'react';

export function ValuesScreen() {
    const [values, setValues] = useState<CoreValue[]>([]);
    const [newValue, setNewValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const data = await api.getValues();
            setValues(data);
        } catch (error) {
            console.error('Failed to load values:', error);
            setError('Failed to load values');
        }
    };

    const addValue = async () => {
        if (!newValue.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            await api.addValue(newValue.trim());
            setNewValue('');
            await loadValues();
        } catch (error) {
            console.error('Failed to add value:', error);
            setError('Failed to add value');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteValue = async (valueName: string) => {
        try {
            await api.deleteValue(valueName);
            await loadValues();
        } catch (error) {
            console.error('Failed to delete value:', error);
            setError('Failed to delete value');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>💎 Core Values</h1>
                <p style={subtitleStyle}>Define what matters most to you</p>
            </div>

            <GlassCard style={inputCardStyle}>
                <input
                    style={inputStyle}
                    placeholder="Add a new value (e.g., Creativity, Health)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addValue()}
                />
                <GradientButton
                    title={isLoading ? 'Adding...' : 'Add Value'}
                    onPress={addValue}
                    gradient={theme.colors.gradientPrimary}
                    loading={isLoading}
                    disabled={!newValue.trim()}
                />
            </GlassCard>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={listStyle}>
                {values.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <p style={emptyTextStyle}>No values yet</p>
                        <p style={emptySubtextStyle}>Add your first core value above</p>
                    </div>
                ) : (
                    values.map((item, index) => (
                        <GlassCard key={index} style={valueCardStyle}>
                            <div style={valueHeaderStyle}>
                                <div style={valueContentStyle}>
                                    <div
                                        style={{
                                            ...valueDotStyle,
                                            backgroundColor: getColorForIndex(index),
                                        }}
                                    />
                                    <span style={valueTextStyle}>{item.value_name}</span>
                                </div>
                                <button
                                    style={deleteButtonStyle}
                                    onClick={() => deleteValue(item.value_name)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = theme.colors.danger;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = theme.colors.textMuted;
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}

const getColorForIndex = (index: number): string => {
    const colors = [
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.success,
        theme.colors.info,
        theme.colors.warning,
    ];
    return colors[index % colors.length];
};

const containerStyle: CSSProperties = {
    padding: theme.spacing.lg,
    maxWidth: '900px',
    margin: '0 auto',
    animation: 'fadeIn 0.4s ease-out',
};

const headerStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const titleStyle: CSSProperties = {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const subtitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
};

const inputCardStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const inputStyle: CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const errorStyle: CSSProperties = {
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
};

const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
};

const valueCardStyle: CSSProperties = {
    animation: 'slideIn 0.3s ease-out',
};

const valueHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
};

const valueContentStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
};

const valueDotStyle: CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
};

const valueTextStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
};

const deleteButtonStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    padding: theme.spacing.sm,
    transition: `color ${theme.animation.normal}`,
};

const emptyStateStyle: CSSProperties = {
    textAlign: 'center',
    padding: `${theme.spacing['3xl']} 0`,
};

const emptyTextStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
};

const emptySubtextStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
};
