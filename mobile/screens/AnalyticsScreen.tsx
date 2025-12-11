import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { api } from '../services/api';
import { theme } from '../theme';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [analyticsData, tasksData] = await Promise.all([
                api.getAnalytics(),
                api.getAllTasks(),
            ]);
            setAnalytics(analyticsData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Calculate completion rate
    const completedTasks = tasks.filter((t) => t.did_it === 1).length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // Calculate average scores
    const completedTasksWithScores = tasks.filter(
        (t) => t.did_it === 1 && t.fulfillment_score
    );
    const avgFulfillment =
        completedTasksWithScores.length > 0
            ? completedTasksWithScores.reduce((sum, t) => sum + (t.fulfillment_score || 0), 0) /
            completedTasksWithScores.length
            : 0;

    const avgMood =
        completedTasksWithScores.length > 0
            ? completedTasksWithScores.reduce((sum, t) => sum + (t.mood_after || 0), 0) /
            completedTasksWithScores.length
            : 0;

    const avgEnergy =
        tasks.length > 0
            ? tasks.reduce((sum, t) => sum + (t.energy_level || 0), 0) / tasks.length
            : 0;

    // Prepare chart data for value breakdown
    const valueColors = ['#667eea', '#f093fb', '#38ef7d', '#4facfe', '#fee140'];
    const pieData =
        analytics?.breakdown.map((item: any, index: number) => ({
            name: item.value_name,
            count: item.task_count,
            color: valueColors[index % valueColors.length],
            legendFontColor: theme.colors.textSecondary,
            legendFontSize: 12,
        })) || [];

    // Weekly trend data (mock for now - you can expand this)
    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [3, 5, 4, 6, 7, 5, 4],
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 3,
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: 'rgba(0, 0, 0, 0)',
        backgroundGradientTo: 'rgba(0, 0, 0, 0)',
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
        propsForLabels: {
            fontSize: 12,
            fontWeight: '600',
        },
        decimalPlaces: 0,
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
            >
                <Text style={styles.title}>📊 Analytics</Text>
                <Text style={styles.subtitle}>Your productivity insights</Text>

                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{analytics?.total_tasks || 0}</Text>
                        <Text style={styles.summaryLabel}>Total Tasks</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{completedTasks}</Text>
                        <Text style={styles.summaryLabel}>Completed</Text>
                    </GlassCard>
                </View>

                {/* Completion Rate Ring */}
                <GlassCard style={styles.progressCard}>
                    <Text style={styles.sectionTitle}>Completion Rate</Text>
                    <View style={styles.progressContainer}>
                        <ProgressRing
                            progress={completionRate}
                            size={140}
                            strokeWidth={14}
                            color={theme.colors.primary}
                        />
                    </View>
                </GlassCard>

                {/* Average Scores */}
                <GlassCard style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Average Scores</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>⭐ {avgFulfillment.toFixed(1)}/10</Text>
                            <Text style={styles.statLabel}>Fulfillment</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>😊 {avgMood.toFixed(1)}/10</Text>
                            <Text style={styles.statLabel}>Mood</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>⚡ {avgEnergy.toFixed(1)}/10</Text>
                            <Text style={styles.statLabel}>Energy</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Value Breakdown */}
                {pieData.length > 0 && (
                    <GlassCard style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>Tasks by Value</Text>
                        <PieChart
                            data={pieData}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="count"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </GlassCard>
                )}

                {/* Weekly Trend */}
                <GlassCard style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
                    <LineChart
                        data={weeklyData}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={false}
                        withOuterLines={false}
                    />
                </GlassCard>

                {/* Value Details */}
                {analytics?.breakdown && analytics.breakdown.length > 0 && (
                    <GlassCard style={styles.valueDetailsCard}>
                        <Text style={styles.sectionTitle}>Value Alignment</Text>
                        {analytics.breakdown.map((item: any, index: number) => (
                            <View key={index} style={styles.valueItem}>
                                <View style={styles.valueHeader}>
                                    <View
                                        style={[
                                            styles.valueDot,
                                            { backgroundColor: valueColors[index % valueColors.length] },
                                        ]}
                                    />
                                    <Text style={styles.valueName}>{item.value_name}</Text>
                                </View>
                                <View style={styles.valueStats}>
                                    <Text style={styles.valueCount}>{item.task_count} tasks</Text>
                                    <Text style={styles.valueFulfillment}>
                                        ⭐ {item.avg_fulfillment.toFixed(1)}
                                    </Text>
                                </View>
                            </View>
                        ))}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
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
    summaryGrid: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    summaryValue: {
        fontSize: theme.typography.sizes['3xl'],
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    progressCard: {
        alignItems: 'center',
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    progressContainer: {
        marginVertical: theme.spacing.md,
    },
    statsCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    chartCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    chart: {
        marginVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    valueDetailsCard: {
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    valueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    valueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    valueDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    valueName: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
        color: theme.colors.text,
    },
    valueStats: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        alignItems: 'center',
    },
    valueCount: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    valueFulfillment: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.warning,
        fontWeight: '600',
    },
});
