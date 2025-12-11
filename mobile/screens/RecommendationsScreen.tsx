import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api, CoreValue, Recommendation, FreeSlot } from '../services/api';
import { theme } from '../theme';

export default function RecommendationsScreen() {
    const [values, setValues] = useState<CoreValue[]>([]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadValues();
        loadFreeSlots();
    }, []);

    const loadValues = async () => {
        try {
            const data = await api.getValues();
            setValues(data);
        } catch (error) {
            console.error('Failed to load values:', error);
        }
    };

    const loadFreeSlots = async () => {
        try {
            const slots = await api.getFreeSlots();
            setFreeSlots(slots);
        } catch (error) {
            console.error('Failed to load free slots:', error);
        }
    };

    const toggleValue = (valueName: string) => {
        if (selectedValues.includes(valueName)) {
            setSelectedValues(selectedValues.filter(v => v !== valueName));
        } else {
            setSelectedValues([...selectedValues, valueName]);
        }
    };

    const fetchRecommendations = async () => {
        if (selectedValues.length === 0) {
            Alert.alert('Select Values', 'Please select at least one core value to get recommendations');
            return;
        }

        setLoading(true);
        try {
            const recs = await api.getRecommendations(selectedValues);
            setRecommendations(recs);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch recommendations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const scheduleActivity = async (activity: Recommendation) => {
        try {
            // Format the suggested time slot for calendar
            const today = new Date().toISOString().split('T')[0];
            const startTime = `${today}T${activity.suggested_slot.start}:00`;
            const endTime = `${today}T${activity.suggested_slot.end}:00`;

            await api.addCalendarEvent(
                `${activity.emoji} ${activity.name}`,
                startTime,
                endTime
            );
            Alert.alert('Success', `Added "${activity.name}" to your calendar!`);
        } catch (error) {
            Alert.alert('Error', 'Failed to add activity to calendar');
            console.error(error);
        }
    };

    const getValueColor = (index: number) => {
        const colors = ['#667eea', '#f093fb', '#38ef7d', '#4facfe', '#fee140', '#fa709a'];
        return colors[index % colors.length];
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>🎯 Discover Activities</Text>
                <Text style={styles.subtitle}>Find activities aligned with your values</Text>
            </View>

            {/* Free Time Slots Display */}
            {freeSlots.length > 0 && (
                <GlassCard style={styles.slotsCard}>
                    <Text style={styles.sectionTitle}>⏰ Available Time Today</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {freeSlots.map((slot, index) => (
                            <View key={index} style={styles.slotChip}>
                                <Text style={styles.slotTime}>{slot.start} - {slot.end}</Text>
                                <Text style={styles.slotDuration}>{slot.duration_minutes} min</Text>
                            </View>
                        ))}
                    </ScrollView>
                </GlassCard>
            )}

            {/* Values Filter */}
            <GlassCard style={styles.valuesCard}>
                <Text style={styles.sectionTitle}>💎 Select Your Values</Text>
                <View style={styles.valuesContainer}>
                    {values.map((value, index) => {
                        const isSelected = selectedValues.includes(value.value_name);
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleValue(value.value_name)}
                                style={[
                                    styles.valueChip,
                                    isSelected && {
                                        backgroundColor: getValueColor(index),
                                        borderColor: getValueColor(index)
                                    }
                                ]}
                            >
                                <Text style={[
                                    styles.valueChipText,
                                    isSelected && styles.valueChipTextSelected
                                ]}>
                                    {value.value_name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <GradientButton
                    title={loading ? "Loading..." : "Get Recommendations"}
                    onPress={fetchRecommendations}
                    gradient={theme.colors.gradientPrimary}
                    style={styles.recommendButton}
                    disabled={loading || selectedValues.length === 0}
                />
            </GlassCard>

            {/* Recommendations List */}
            <FlatList
                data={recommendations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <GlassCard style={styles.recommendationCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.activityEmoji}>{item.emoji}</Text>
                            <View style={styles.cardHeaderText}>
                                <Text style={styles.activityName}>{item.name}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{item.category}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.description}>{item.description}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Duration</Text>
                                <Text style={styles.metaValue}>{item.duration_minutes} min</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Suggested Time</Text>
                                <Text style={styles.metaValue}>
                                    {item.suggested_slot.start} - {item.suggested_slot.end}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.valuesRow}>
                            <Text style={styles.valuesLabel}>Aligned Values:</Text>
                            <View style={styles.matchingValues}>
                                {item.matching_values.map((val, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.valueDot,
                                            { backgroundColor: getValueColor(values.findIndex(v => v.value_name.toLowerCase() === val.toLowerCase())) }
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        <GradientButton
                            title="📅 Schedule This"
                            onPress={() => scheduleActivity(item)}
                            gradient={theme.colors.gradientSecondary}
                            style={styles.scheduleButton}
                        />
                    </GlassCard>
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    loading ? null : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                {selectedValues.length === 0
                                    ? 'Select values above to discover activities'
                                    : 'No matching activities found'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {selectedValues.length === 0
                                    ? 'Choose what matters most to you'
                                    : 'Try selecting different values or check if you have free time'}
                            </Text>
                        </View>
                    )
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.lg,
        paddingTop: 60,
    },
    title: {
        fontSize: theme.typography.sizes['3xl'],
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
    },
    slotsCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    slotChip: {
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.4)',
    },
    slotTime: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
        fontWeight: '600',
    },
    slotDuration: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    valuesCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    valuesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    valueChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    valueChipText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    valueChipTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    recommendButton: {
        marginTop: theme.spacing.sm,
    },
    list: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    recommendationCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.md,
    },
    activityEmoji: {
        fontSize: 40,
    },
    cardHeaderText: {
        flex: 1,
    },
    activityName: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    categoryBadge: {
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    description: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
        lineHeight: 22,
        marginBottom: theme.spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        marginBottom: 4,
    },
    metaValue: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        fontWeight: '600',
    },
    valuesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    valuesLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    matchingValues: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    valueDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    scheduleButton: {
        // Gradient button styles
    },
    emptyState: {
        alignItems: 'center',
        marginTop: theme.spacing.xl * 2,
        paddingHorizontal: theme.spacing.xl,
    },
    emptyText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});
