import { useState, useEffect, type CSSProperties } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api } from '../services/api';
import type { CoreValue } from '../types';
import { theme } from '../styles/theme';

export function PredictorScreen() {
    const [taskType, setTaskType] = useState('');
    const [alignedValue, setAlignedValue] = useState('');
    const [energyLevel, setEnergyLevel] = useState(6);
    const [moodBefore, setMoodBefore] = useState(5);
    const [prediction, setPrediction] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState<CoreValue[]>([]);

    useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const data = await api.getValues();
            setValues(data);
        } catch (error) {
            console.error('Failed to load values:', error);
        }
    };

    const predictFulfillment = async () => {
        if (!taskType.trim() || !alignedValue) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const score = await api.getPredictedFulfillment(
                taskType,
                alignedValue,
                energyLevel,
                moodBefore
            );
            setPrediction(score);
        } catch (error) {
            console.error('Failed to get prediction:', error);
            alert('Failed to get prediction');
        } finally {
            setIsLoading(false);
        }
    };

    const getPredictionColor = (score: number): string => {
        if (score >= 7) return theme.colors.success;
        if (score >= 4) return theme.colors.warning;
        return theme.colors.danger;
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>🔮 Fulfillment Predictor</h1>
                <p style={subtitleStyle}>Predict how fulfilling a task will be</p>
            </div>

            <GlassCard style={formCardStyle}>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Task Type</label>
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="e.g., Exercise, Reading, Meeting"
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>Aligned Value</label>
                    <select
                        style={selectStyle}
                        value={alignedValue}
                        onChange={(e) => setAlignedValue(e.target.value)}
                    >
                        <option value="">Select a value...</option>
                        {values.map((v, idx) => (
                            <option key={idx} value={v.value_name}>
                                {v.value_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>⚡ Energy Level: {energyLevel}</label>
                    <div style={scaleButtonsStyle}>
                        {[...Array(10)].map((_, i) => (
                            <button
                                key={i}
                                style={{
                                    ...scaleButtonStyle,
                                    ...(energyLevel === i + 1 ? scaleButtonActiveStyle : {}),
                                }}
                                onClick={() => setEnergyLevel(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={formGroupStyle}>
                    <label style={labelStyle}>😊 Current Mood: {moodBefore}</label>
                    <div style={scaleButtonsStyle}>
                        {[...Array(10)].map((_, i) => (
                            <button
                                key={i}
                                style={{
                                    ...scaleButtonStyle,
                                    ...(moodBefore === i + 1 ? scaleButtonActiveStyle : {}),
                                }}
                                onClick={() => setMoodBefore(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <GradientButton
                    title="Predict Fulfillment"
                    onPress={predictFulfillment}
                    loading={isLoading}
                    gradient={theme.colors.gradientInfo}
                    style={predictButtonStyle}
                />
            </GlassCard>

            {prediction !== null && (
                <GlassCard variant="strong" style={resultCardStyle}>
                    <h3 style={resultTitleStyle}>Prediction Results</h3>
                    <div style={predictionValueStyle}>
                        <div
                            style={{
                                fontSize: theme.typography.sizes['4xl'],
                                fontWeight: '900',
                                color: getPredictionColor(prediction),
                            }}
                        >
                            {prediction.toFixed(1)}
                        </div>
                        <div style={predictionLabelStyle}>out of 10</div>
                    </div>
                    <div style={predictionDescStyle}>
                        {prediction >= 7
                            ? '🎉 This task is likely to be very fulfilling!'
                            : prediction >= 4
                                ? '👍 This task should be moderately fulfilling'
                                : '💭 Consider if this task aligns with your goals'}
                    </div>
                </GlassCard>
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

const formCardStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const formGroupStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    display: 'block',
};

const inputStyle: CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
};

const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
};

const scaleButtonsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
};

const scaleButtonStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.colors.glassBorder}`,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${theme.animation.normal}`,
};

const scaleButtonActiveStyle: CSSProperties = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: theme.colors.text,
};

const predictButtonStyle: CSSProperties = {
    marginTop: theme.spacing.md,
};

const resultCardStyle: CSSProperties = {
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-out',
};

const resultTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
};

const predictionValueStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const predictionLabelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
};

const predictionDescStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
};
