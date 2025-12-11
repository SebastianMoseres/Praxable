import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { theme } from '../theme';

interface Task {
    id?: number;
    task_name: string;
    task_type: string;
    time_preference: string;
    aligned_value: string;
    did_it?: number;
}

interface TaskCardProps {
    task: Task;
    onComplete?: (taskId: number) => void;
    showCheckbox?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onComplete,
    showCheckbox = true,
}) => {
    const [scaleValue] = useState(new Animated.Value(1));
    const isCompleted = task.did_it === 1;

    const handlePress = () => {
        if (task.id && onComplete && !isCompleted) {
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onComplete(task.id!);
            });
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <GlassCard style={[styles.card, isCompleted ? styles.completedCard : null] as any}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        {showCheckbox && (
                            <TouchableOpacity
                                onPress={handlePress}
                                disabled={isCompleted}
                                style={styles.checkbox}
                            >
                                <View
                                    style={[
                                        styles.checkboxInner,
                                        isCompleted && styles.checkboxChecked,
                                    ]}
                                >
                                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        )}
                        <View style={styles.titleContainer}>
                            <Text
                                style={[styles.title, isCompleted && styles.completedText]}
                                numberOfLines={2}
                            >
                                {task.task_name}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <LinearGradient
                                colors={theme.colors.gradientInfo as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.badge}
                            >
                                <Text style={styles.badgeText}>{task.task_type}</Text>
                            </LinearGradient>
                            <Text style={styles.time}>⏰ {task.time_preference}</Text>
                        </View>
                        <View style={styles.valueContainer}>
                            <Text style={styles.valueLabel}>💎</Text>
                            <Text style={styles.valueText}>{task.aligned_value}</Text>
                        </View>
                    </View>
                </View>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.md,
    },
    completedCard: {
        opacity: 0.7,
    },
    content: {
        gap: theme.spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    checkbox: {
        padding: theme.spacing.xs,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 2,
        borderColor: theme.colors.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        lineHeight: theme.typography.sizes.lg * theme.typography.lineHeights.normal,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: theme.colors.textSecondary,
    },
    details: {
        gap: theme.spacing.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    badge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs / 2,
        borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
        color: theme.colors.text,
        fontSize: theme.typography.sizes.xs,
        fontWeight: '600',
    },
    time: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    valueContainer: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    valueLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
    valueText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.secondary,
        fontWeight: '600',
    },
});
