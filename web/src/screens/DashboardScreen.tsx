import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { theme } from '../styles/theme';
import { api } from '../services/api';
import type { AnalyticsResponse, CalendarEvent, CoreValue } from '../types';

export function DashboardScreen() {
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
    const [randomValue, setRandomValue] = useState<CoreValue | null>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        loadDashboardData();
        setGreeting(getGreeting());
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load analytics
            const analyticsData = await api.getAnalytics();
            setAnalytics(analyticsData);

            // Load calendar for next event
            const events = await api.getCalendarEvents();
            // Simple logic: find first event that hasn't ended yet
            const now = new Date();
            const upcoming = events.find(e => new Date(e.end) > now);
            setNextEvent(upcoming || null);

            // Load values for inspiration
            const values = await api.getValues();
            if (values.length > 0) {
                const random = values[Math.floor(Math.random() * values.length)];
                setRandomValue(random);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>{greeting}, Sebastian.</h1>
                <p style={subtitleStyle}>Ready to align your day?</p>
            </header>

            <div style={gridStyle}>
                {/* Main Action: Planner */}
                <Link to="/planner" style={linkStyle}>
                    <GlassCard style={{ ...cardStyle, ...plannerCardStyle }}>
                        <div style={cardIconStyle}>✨</div>
                        <h3 style={cardTitleStyle}>Plan Your Day</h3>
                        <p style={cardDescStyle}>Use AI to schedule tasks aligned with your values.</p>
                        <div style={arrowStyle}>→</div>
                    </GlassCard>
                </Link>

                {/* Secondary: Analytics Summary */}
                <Link to="/analytics" style={linkStyle}>
                    <GlassCard style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <span style={cardIconStyle}>📊</span>
                            <span style={cardLabelStyle}>Progress</span>
                        </div>
                        <div style={statContainerStyle}>
                            <span style={statValueStyle}>{analytics?.total_tasks || 0}</span>
                            <span style={statLabelStyle}>Total Tasks</span>
                        </div>
                        {analytics?.breakdown && analytics.breakdown.length > 0 && (
                            <p style={miniStatStyle}>
                                Top Value: {analytics.breakdown.sort((a, b) => b.task_count - a.task_count)[0].value_name}
                            </p>
                        )}
                    </GlassCard>
                </Link>

                {/* Secondary: Next Event */}
                <Link to="/calendar" style={linkStyle}>
                    <GlassCard style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <span style={cardIconStyle}>📅</span>
                            <span style={cardLabelStyle}>Up Next</span>
                        </div>
                        {nextEvent ? (
                            <>
                                <h4 style={eventTitleStyle}>{nextEvent.summary}</h4>
                                <p style={eventTimeStyle}>
                                    {new Date(nextEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </>
                        ) : (
                            <p style={emptyStateStyle}>No upcoming events today.</p>
                        )}
                    </GlassCard>
                </Link>

                {/* Tertiary: Value Reminder */}
                <Link to="/values" style={linkStyle}>
                    <GlassCard style={{ ...cardStyle, ...valueCardStyle }}>
                        <div style={cardHeaderStyle}>
                            <span style={cardIconStyle}>💎</span>
                            <span style={cardLabelStyle}>Remember</span>
                        </div>
                        {randomValue ? (
                            <h3 style={valueTextStyle}>{randomValue.value_name}</h3>
                        ) : (
                            <p style={emptyStateStyle}>Add values to see them here.</p>
                        )}
                    </GlassCard>
                </Link>

                {/* Tertiary: Discover */}
                <Link to="/discover" style={{ ...linkStyle, gridColumn: 'span 2' }}>
                    <GlassCard style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <span style={cardIconStyle}>🎯</span>
                            <span style={cardLabelStyle}>Discover</span>
                        </div>
                        <p style={cardDescStyle}>Find new activities that match your free time.</p>
                    </GlassCard>
                </Link>
            </div>
        </div>
    );
}

const containerStyle: CSSProperties = {
    padding: theme.spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto',
    animation: 'fadeIn 0.5s ease-out',
};

const headerStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const titleStyle: CSSProperties = {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const subtitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
};

const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.lg,
};

const linkStyle: CSSProperties = {
    textDecoration: 'none',
    display: 'block',
};

const cardStyle: CSSProperties = {
    height: '100%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, background 0.2s',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
};

// Add hover effect manually since we are using inline styles (can't easily do :hover)
// In a real app with styled-components or CSS modules this is easier.
// For now, we rely on the component's internal hover handling or just basic transitions.

const plannerCardStyle: CSSProperties = {
    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gridRow: 'span 2', // Make it tall
    border: `1px solid ${theme.colors.primary}`,
};

const cardIconStyle: CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: theme.spacing.md,
};

const cardTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
};

const cardDescStyle: CSSProperties = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
};

const arrowStyle: CSSProperties = {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.primary,
};

const cardHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
};

const cardLabelStyle: CSSProperties = {
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.textMuted,
};

const statContainerStyle: CSSProperties = {
    marginTop: 'auto',
};

const statValueStyle: CSSProperties = {
    fontSize: '3rem',
    fontWeight: '900',
    display: 'block',
    lineHeight: '1',
    color: theme.colors.text,
};

const statLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
};

const miniStatStyle: CSSProperties = {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success,
    fontWeight: '600',
};

const eventTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const eventTimeStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '300',
    color: theme.colors.primary,
};

const emptyStateStyle: CSSProperties = {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
};

const valueCardStyle: CSSProperties = {
    justifyContent: 'center',
    textAlign: 'center',
};

const valueTextStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '800',
    background: `linear-gradient(90deg, #FFD700, #FFA500)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};
