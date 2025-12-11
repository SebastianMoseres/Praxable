import { useState, useEffect, type CSSProperties } from 'react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import type { AnalyticsResponse } from '../types';
import { theme } from '../styles/theme';

export function AnalyticsScreen() {
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const getScoreColor = (score: number): string => {
        if (score >= 7) return theme.colors.success;
        if (score >= 4) return theme.colors.warning;
        return theme.colors.danger;
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>📊 Analytics</h1>
                <p style={subtitleStyle}>Your value alignment statistics</p>
            </div>

            {isLoading ? (
                <div style={loadingStyle}>Loading analytics...</div>
            ) : analytics ? (
                <>
                    <GlassCard variant="strong" style={summaryCardStyle}>
                        <div style={summaryContentStyle}>
                            <div style={summaryItemStyle}>
                                <div style={summaryValueStyle}>{analytics.total_tasks}</div>
                                <div style={summaryLabelStyle}>Total Tasks</div>
                            </div>
                            <div style={summaryItemStyle}>
                                <div style={summaryValueStyle}>{analytics.breakdown.length}</div>
                                <div style={summaryLabelStyle}>Values Tracked</div>
                            </div>
                        </div>
                    </GlassCard>

                    <section style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>Value Breakdown</h2>
                        {analytics.breakdown.length === 0 ? (
                            <GlassCard>
                                <p style={emptyTextStyle}>No data available yet. Start completing tasks!</p>
                            </GlassCard>
                        ) : (
                            analytics.breakdown.map((item, index) => (
                                <GlassCard key={index} style={valueCardStyle}>
                                    <div style={valueHeaderStyle}>
                                        <div style={valueNameContainerStyle}>
                                            <div
                                                style={{
                                                    ...valueDotStyle,
                                                    backgroundColor: getColorForIndex(index),
                                                }}
                                            />
                                            <div style={valueNameStyle}>{item.value_name}</div>
                                        </div>
                                        <div style={valueStatsStyle}>
                                            <div style={statItemStyle}>
                                                <span style={statLabelStyle}>Tasks:</span>
                                                <span style={statValueStyle}>{item.task_count}</span>
                                            </div>
                                            <div style={statItemStyle}>
                                                <span style={statLabelStyle}>Avg Fulfillment:</span>
                                                <span
                                                    style={{
                                                        ...statValueStyle,
                                                        color: getScoreColor(item.avg_fulfillment),
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    {item.avg_fulfillment.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={progressBarContainerStyle}>
                                        <div
                                            style={{
                                                ...progressBarFillStyle,
                                                width: `${(item.avg_fulfillment / 10) * 100}%`,
                                                backgroundColor: getScoreColor(item.avg_fulfillment),
                                            }}
                                        />
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </section>
                </>
            ) : (
                <div style={errorStyle}>Failed to load analytics</div>
            )}
        </div>
    );
}

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

const loadingStyle: CSSProperties = {
    textAlign: 'center',
    padding: theme.spacing['3xl'],
    color: theme.colors.textSecondary,
};

const summaryCardStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const summaryContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    gap: theme.spacing.xl,
};

const summaryItemStyle: CSSProperties = {
    textAlign: 'center',
    flex: 1,
};

const summaryValueStyle: CSSProperties = {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
};

const summaryLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
};

const sectionStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const valueCardStyle: CSSProperties = {
    marginBottom: theme.spacing.md,
    animation: 'slideIn 0.3s ease-out',
};

const valueHeaderStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
    gap: theme.spacing.md,
};

const valueNameContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
};

const valueDotStyle: CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
};

const valueNameStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
};

const valueStatsStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.lg,
};

const statItemStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.xs,
    alignItems: 'baseline',
};

const statLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
};

const statValueStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text,
};

const progressBarContainerStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
};

const progressBarFillStyle: CSSProperties = {
    height: '100%',
    borderRadius: theme.borderRadius.full,
    transition: 'width 0.5s ease-out',
};

const emptyTextStyle: CSSProperties = {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.lg,
};

const errorStyle: CSSProperties = {
    textAlign: 'center',
    color: theme.colors.danger,
    padding: theme.spacing.xl,
};
