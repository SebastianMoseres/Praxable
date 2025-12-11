import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    gradient?: string[];
    style?: ViewStyle;
    textStyle?: any;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    gradient = theme.colors.gradientPrimary,
    style,
    textStyle,
}) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const isDisabled = disabled || loading;

    return (
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={isDisabled ? ['#4b5563', '#374151'] as const : gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, isDisabled && styles.disabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.text, textStyle]}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        ...theme.shadows.glow,
    },
    text: {
        color: theme.colors.text,
        fontSize: theme.typography.sizes.lg,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.6,
    },
});
