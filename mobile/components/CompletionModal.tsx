import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';
import { theme } from '../theme';

interface CompletionModalProps {
    visible: boolean;
    taskName: string;
    onSubmit: (moodAfter: number, fulfillmentScore: number) => void;
    onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
    visible,
    taskName,
    onSubmit,
    onClose,
}) => {
    const [moodAfter, setMoodAfter] = useState(5);
    const [fulfillmentScore, setFulfillmentScore] = useState(5);
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const handleSubmit = () => {
        onSubmit(moodAfter, fulfillmentScore);
        setMoodAfter(5);
        setFulfillmentScore(5);
    };

    const renderScale = (
        label: string,
        value: number,
        setValue: (val: number) => void,
        emoji: string
    ) => (
        <View style={styles.scaleContainer}>
            <Text style={styles.scaleLabel}>
                {emoji} {label}
            </Text>
            <Text style={styles.scaleValue}>{value}/10</Text>
            <View style={styles.scaleButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[styles.scaleButton, value === num && styles.scaleButtonActive]}
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
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <View style={styles.modalContainer}>
                    <GlassCard variant="strong" style={styles.modal}>
                        <View style={styles.header}>
                            <Text style={styles.title}>🎉 Task Complete!</Text>
                            <Text style={styles.taskName} numberOfLines={2}>
                                {taskName}
                            </Text>
                        </View>

                        <Text style={styles.subtitle}>How did it go?</Text>

                        {renderScale('Mood After', moodAfter, setMoodAfter, '😊')}
                        {renderScale(
                            'Fulfillment',
                            fulfillmentScore,
                            setFulfillmentScore,
                            '⭐'
                        )}

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <GradientButton
                                title="Submit"
                                onPress={handleSubmit}
                                gradient={theme.colors.gradientSuccess}
                                style={styles.submitButton}
                            />
                        </View>
                    </GlassCard>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
    },
    modal: {
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.sizes['2xl'],
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    taskName: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    scaleContainer: {
        marginBottom: theme.spacing.lg,
    },
    scaleLabel: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    scaleValue: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    scaleButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
    },
    scaleButton: {
        width: 36,
        height: 36,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    scaleButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    scaleButtonText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: '600',
    },
    scaleButtonTextActive: {
        color: theme.colors.text,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
    },
});
