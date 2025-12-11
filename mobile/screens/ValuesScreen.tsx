import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api, CoreValue } from '../services/api';
import { theme } from '../theme';

export default function ValuesScreen() {
    const [values, setValues] = useState<CoreValue[]>([]);
    const [newValue, setNewValue] = useState('');

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

    const addValue = async () => {
        if (!newValue.trim()) return;
        try {
            await api.addValue(newValue.trim());
            setNewValue('');
            loadValues();
        } catch (error) {
            Alert.alert('Error', 'Failed to add value');
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>💎 Core Values</Text>
                <Text style={styles.subtitle}>Define what matters most to you</Text>
            </View>

            <GlassCard style={styles.inputCard}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a new value (e.g., Creativity, Health)"
                    placeholderTextColor={theme.colors.textMuted}
                    value={newValue}
                    onChangeText={setNewValue}
                />
                <GradientButton
                    title="Add Value"
                    onPress={addValue}
                    gradient={theme.colors.gradientPrimary}
                    style={styles.addButton}
                />
            </GlassCard>

            <FlatList
                data={values}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <GlassCard style={styles.valueCard}>
                        <View style={styles.valueHeader}>
                            <View
                                style={[
                                    styles.valueDot,
                                    { backgroundColor: ['#667eea', '#f093fb', '#38ef7d', '#4facfe', '#fee140'][index % 5] },
                                ]}
                            />
                            <Text style={styles.valueText}>{item.value_name}</Text>
                        </View>
                    </GlassCard>
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No values yet</Text>
                        <Text style={styles.emptySubtext}>Add your first core value above</Text>
                    </View>
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
        marginBottom: theme.spacing.sm,
    },
    inputCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    addButton: {
        // Gradient button styles
    },
    list: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    valueCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    valueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    valueDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    valueText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: theme.spacing.xl * 2,
    },
    emptyText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
});
