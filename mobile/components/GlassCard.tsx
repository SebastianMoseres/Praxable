import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    variant?: 'default' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 20,
    variant = 'default',
}) => {
    const cardStyle = variant === 'strong' ? styles.cardStrong : styles.card;

    return (
        <View style={[cardStyle, style]}>
            <BlurView intensity={intensity} style={styles.blur}>
                <View style={styles.content}>
                    {children}
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    cardStrong: {
        backgroundColor: theme.colors.glassHighlight,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    blur: {
        overflow: 'hidden',
        borderRadius: theme.borderRadius.lg,
    },
    content: {
        padding: theme.spacing.md,
    },
});
