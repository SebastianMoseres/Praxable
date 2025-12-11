import { useState, useEffect, type CSSProperties } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api } from '../services/api';
import type { CoreValue, Recommendation, FreeSlot } from '../types';
import { theme } from '../styles/theme';

export function RecommendationsScreen() {
    const [values, setValues] = useState<CoreValue[]>([]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [valuesData, slotsData] = await Promise.all([
                api.getValues(),
                api.getFreeSlots(),
            ]);
            setValues(valuesData);
            setFreeSlots(slotsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const toggleValue = (valueName: string) => {
        setSelectedValues((prev) =>
            prev.includes(valueName)
                ? prev.filter((v) => v !== valueName)
                : [...prev, valueName]
        );
    };

    const getRecommendations = async () => {
        if (selectedValues.length === 0) {
            alert('Please select at least one value');
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.getRecommendations(selectedValues);
            setRecommendations(data);
        } catch (error) {
            console.error('Failed to get recommendations:', error);
            alert('Failed to get recommendations');
        } finally {
            setIsLoading(false);
        }
    };

    const scheduleActivity = async (activity: Recommendation) => {
        try {
            const slot = activity.suggested_slot;
            await api.addCalendarEvent(
                activity.name,
                slot.start,
                slot.end
            );
            alert(`"${activity.name}" added to your calendar!`);
        } catch (error) {
            console.error('Failed to schedule activity:', error);
            alert('Failed to schedule activity');
        }
    };

    const formatTime = (isoString: string) => {
        try {
            if (!isoString) return 'N/A';

            // Check if it's just a time string like "13:28" (HH:MM format)
            if (/^\d{1,2}:\d{2}$/.test(isoString)) {
                // Parse as time-only and format
                const [hours, minutes] = isoString.split(':').map(Number);
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }

            // Otherwise treat as ISO datetime
            const date = new Date(isoString);
            if (isNaN(date.getTime())) {
                return 'Invalid time';
            }
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting time:', isoString, error);
            return 'Invalid time';
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>🎯 Discover Activities</h1>
                <p style={subtitleStyle}>Find activities aligned with your values</p>
            </div>

            <GlassCard style={sectionCardStyle}>
                <h3 style={sectionTitleStyle}>Select Your Values</h3>
                <div style={valuesGridStyle}>
                    {values.map((value, index) => (
                        <button
                            key={index}
                            style={{
                                ...valueButtonStyle,
                                ...(selectedValues.includes(value.value_name) ? valueButtonActiveStyle : {}),
                            }}
                            onClick={() => toggleValue(value.value_name)}
                        >
                            💎 {value.value_name}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {freeSlots.length > 0 && (
                <GlassCard style={sectionCardStyle}>
                    <h3 style={sectionTitleStyle}>Available Time Today</h3>
                    <div style={freeSlotsGridStyle}>
                        {freeSlots.map((slot, index) => (
                            <div key={index} style={freeSlotItemStyle}>
                                <span>⏰</span>
                                <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                                <span style={durationBadgeStyle}>{slot.duration_minutes}m</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            <GradientButton
                title="Get Recommendations"
                onPress={getRecommendations}
                loading={isLoading}
                disabled={selectedValues.length === 0}
                gradient={theme.colors.gradientInfo}
                style={getRecsButtonStyle}
            />

            {recommendations.length > 0 && (
                <section style={recommendationsSectionStyle}>
                    <h2 style={recommendationsTitleStyle}>Recommended Activities</h2>
                    {recommendations.map((rec, index) => (
                        <GlassCard key={index} style={activityCardStyle}>
                            <div style={activityHeaderStyle}>
                                <div style={activityEmojiStyle}>{rec.emoji}</div>
                                <div style={activityContentStyle}>
                                    <div style={activityNameStyle}>{rec.name}</div>
                                    <div style={activityDescStyle}>{rec.description}</div>
                                    <div style={activityMetaStyle}>
                                        <span style={metaBadgeStyle}>
                                            {rec.category}
                                        </span>
                                        <span style={metaBadgeStyle}>
                                            {rec.duration_minutes}m
                                        </span>
                                        <span style={matchBadgeStyle}>
                                            {rec.match_score}% match
                                        </span>
                                    </div>
                                    <div style={alignedValuesStyle}>
                                        <strong>Aligned Values: </strong>
                                        {rec.matching_values.join(', ')}
                                    </div>
                                    {rec.suggested_slot && (
                                        <div style={suggestedTimeStyle}>
                                            💡 Suggested: {formatTime(rec.suggested_slot.start)} - {formatTime(rec.suggested_slot.end)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <GradientButton
                                title="Add to Calendar"
                                onPress={() => scheduleActivity(rec)}
                                gradient={theme.colors.gradientSuccess}
                                style={scheduleButtonStyle}
                            />
                        </GlassCard>
                    ))}
                </section>
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

const sectionCardStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const valuesGridStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
};

const valueButtonStyle: CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.colors.glassBorder}`,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${theme.animation.normal}`,
};

const valueButtonActiveStyle: CSSProperties = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: theme.colors.text,
    boxShadow: theme.shadows.glow,
};

const freeSlotsGridStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
};

const freeSlotItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(56, 239, 125, 0.1)',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
};

const durationBadgeStyle: CSSProperties = {
    marginLeft: 'auto',
    padding: `2px ${theme.spacing.sm}`,
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
};

const getRecsButtonStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const recommendationsSectionStyle: CSSProperties = {
    animation: 'fadeIn 0.5s ease-out',
};

const recommendationsTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const activityCardStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
    animation: 'slideIn 0.3s ease-out',
};

const activityHeaderStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
};

const activityEmojiStyle: CSSProperties = {
    fontSize: theme.typography.sizes['3xl'],
    flexShrink: 0,
};

const activityContentStyle: CSSProperties = {
    flex: 1,
};

const activityNameStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const activityDescStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
};

const activityMetaStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
};

const metaBadgeStyle: CSSProperties = {
    padding: `2px ${theme.spacing.sm}`,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
};

const matchBadgeStyle: CSSProperties = {
    ...metaBadgeStyle,
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    color: theme.colors.info,
    fontWeight: '700',
};

const alignedValuesStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
};

const suggestedTimeStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success,
    fontWeight: '600',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(56, 239, 125, 0.1)',
    borderRadius: theme.borderRadius.sm,
};

const scheduleButtonStyle: CSSProperties = {
    marginTop: theme.spacing.md,
};
