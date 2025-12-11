import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api, CoreValue } from '../services/api';
import { theme } from '../theme';

export default function PredictorScreen() {
    const [taskType, setTaskType] = useState('');
    const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [moodBefore, setMoodBefore] = useState(5);
    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const data = await api.getValues();
            setCoreValues(data);
            if (data.length > 0) {
                setSelectedValue(data[0].value_name);
            }
        } catch (error) {
            console.error('Failed to load values:', error);
            Alert.alert('Error', 'Failed to load core values');
        }
    };

    const handlePredict = async () => {
        if (!taskType.trim()) {
            Alert.alert('Missing Input', 'Please enter a task type');
            return;
        }
        if (!selectedValue) {
            Alert.alert('Missing Input', 'Please select a core value');
            return;
        }

        setLoading(true);
        setPrediction(null);
        try {
            const score = await api.getPredictedFulfillment(
                taskType,
                selectedValue,
                energyLevel,
                moodBefore
            );
            setPrediction(score);
            if (score === null) {
                Alert.alert('Notice', 'Model not trained yet or not enough data.');
            }
        } catch (error) {
            console.error('Prediction failed:', error);
            Alert.alert('Error', 'Failed to get prediction');
        } finally {
            setLoading(false);
        }
    };

    const renderScale = (
        label: string,
        value: number,
        setValue: (val: number) => void,
        emoji: string
    ) => (
        <View style={styles.scaleContainer}>
            <Text style={styles.label}>
                {emoji} {label}
            </Text>
            <View style={styles.scaleButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.scaleButton,
                            value === num && styles.scaleButtonActive,
                        ]}
                        onPress={() => setValue(num)}
                    >
                        <Text
                            style={[
                                styles.scaleButtonText,
                                value === num && styles.scaleButtonTextActive,
                            ]}
                        >
                            {num}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>🔮 Fulfillment Predictor</Text>
                <Text style={styles.subtitle}>
                    Predict how fulfilling a task will be before you start
                </Text>

                <GlassCard style={styles.formCard}>
                    <Text style={styles.label}>Task Type</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Coding, Exercise, Reading"
                        placeholderTextColor={theme.colors.textMuted}
                        value={taskType}
                        onChangeText={setTaskType}
                    />
                </GlassCard>

                <GlassCard style={styles.formCard}>
                    <Text style={styles.label}>Aligned Value</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsContainer}
                    >
                        {coreValues.map((val) => (
                            <TouchableOpacity
                                key={val.value_name}
                                style={[
                                    styles.chip,
                                    selectedValue === val.value_name && styles.chipActive,
                                ]}
                                onPress={() => setSelectedValue(val.value_name)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedValue === val.value_name &&
                                        styles.chipTextActive,
                                    ]}
                                >
                                    {val.value_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </GlassCard>

                <GlassCard style={styles.formCard}>
                    {renderScale('Energy Level', energyLevel, setEnergyLevel, '⚡')}
                    {renderScale('Mood Before', moodBefore, setMoodBefore, '😊')}
                </GlassCard>

                <GradientButton
                    title="Predict Fulfillment"
                    onPress={handlePredict}
                    loading={loading}
                    gradient={theme.colors.gradientPrimary}
                    style={styles.predictButton}
                />

                {prediction !== null && (
                    <GlassCard variant="strong" style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Predicted Fulfillment Score</Text>
                        <LinearGradient
                            colors={theme.colors.gradientSuccess as any}
                            style={styles.scoreContainer}
                        >
                            <Text style={styles.resultScore}>{prediction.toFixed(1)}</Text>
                        </LinearGradient>
                        <Text style={styles.resultContext}>out of 10</Text>
                        <View style={styles.interpretation}>
                            {prediction >= 7 && (
                                <Text style={styles.interpretationText}>
                                    ⭐ High fulfillment expected!
                                </Text>
                            )}
                            {prediction >= 4 && prediction < 7 && (
                                <Text style={styles.interpretationText}>
                                    ✨ Moderate fulfillment expected
                                </Text>
                            )}
                            {prediction < 4 && (
                                <Text style={styles.interpretationText}>
                                    💡 Consider adjusting timing or approach
                                </Text>
                            )}
                        </View>
                    </GlassCard>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: 40,
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
        marginBottom: theme.spacing.lg,
    },
    formCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
        marginBottom: theme.spacing.sm,
        color: theme.colors.text,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipsContainer: {
        flexDirection: 'row',
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.xl,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    chipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        fontSize: theme.typography.sizes.sm,
    },
    chipTextActive: {
        color: theme.colors.text,
    },
    scaleContainer: {
        marginBottom: theme.spacing.lg,
    },
    scaleButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
    },
    scaleButton: {
        width: 32,
        height: 32,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    scaleButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    scaleButtonText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.xs,
        fontWeight: '600',
    },
    scaleButtonTextActive: {
        color: theme.colors.text,
    },
    predictButton: {
        marginBottom: theme.spacing.lg,
    },
    resultCard: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    scoreContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.glow,
    },
    resultScore: {
        fontSize: theme.typography.sizes['5xl'],
        fontWeight: '700',
        color: theme.colors.text,
    },
    resultContext: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.md,
    },
    interpretation: {
        marginTop: theme.spacing.sm,
    },
    interpretationText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        fontWeight: '600',
        textAlign: 'center',
    },
});
