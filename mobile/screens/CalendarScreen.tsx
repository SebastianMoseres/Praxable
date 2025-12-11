import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { TaskCard } from '../components/TaskCard';
import { CompletionModal } from '../components/CompletionModal';
import { ProgressRing } from '../components/ProgressRing';
import { api, CalendarEvent } from '../services/api';
import { theme } from '../theme';

export default function CalendarScreen() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const [eventsData, tasksData] = await Promise.all([
                api.getCalendarEvents(),
                api.getAllTasks(),
            ]);
            setEvents(eventsData);
            // Filter today's tasks
            const today = new Date().toISOString().split('T')[0];
            const todayTasks = tasksData.filter((t: any) => t.date === today || !t.date);
            setTasks(todayTasks);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    const handleTaskComplete = (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            setSelectedTask(task);
            setModalVisible(true);
        }
    };

    const handleSubmitFeedback = async (moodAfter: number, fulfillmentScore: number) => {
        if (selectedTask) {
            try {
                await api.completeTask(selectedTask.id, moodAfter, fulfillmentScore);
                setModalVisible(false);
                setSelectedTask(null);
                loadEvents(); // Reload to show updated completion status
            } catch (error) {
                console.error('Failed to complete task:', error);
            }
        }
    };

    const completedTasks = tasks.filter((t) => t.did_it === 1).length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const renderEvent = ({ item }: { item: CalendarEvent }) => {
        const startTime = new Date(item.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        const endTime = new Date(item.end).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <GlassCard style={styles.eventCard}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{startTime}</Text>
                    <Text style={styles.timeSeparator}>-</Text>
                    <Text style={styles.timeText}>{endTime}</Text>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.eventTitle}>{item.summary}</Text>
                </View>
            </GlassCard>
        );
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>📅 Today</Text>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            </View>

            {/* Progress Summary */}
            <GlassCard style={styles.progressCard}>
                <View style={styles.progressContent}>
                    <ProgressRing
                        progress={completionRate}
                        size={80}
                        strokeWidth={8}
                        color={theme.colors.success}
                    />
                    <View style={styles.progressText}>
                        <Text style={styles.progressTitle}>Today's Progress</Text>
                        <Text style={styles.progressSubtitle}>
                            {completedTasks} of {tasks.length} tasks completed
                        </Text>
                    </View>
                </View>
            </GlassCard>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={[
                        { type: 'section', title: 'Your Tasks' },
                        ...tasks.map((t) => ({ type: 'task', data: t })),
                        { type: 'section', title: 'Calendar Events' },
                        ...events.map((e) => ({ type: 'event', data: e })),
                    ]}
                    renderItem={({ item }: any) => {
                        if (item.type === 'section') {
                            return <Text style={styles.sectionTitle}>{item.title}</Text>;
                        } else if (item.type === 'task') {
                            return (
                                <TaskCard
                                    task={item.data}
                                    onComplete={handleTaskComplete}
                                    showCheckbox={true}
                                />
                            );
                        } else {
                            return renderEvent({ item: item.data });
                        }
                    }}
                    keyExtractor={(item, index) => `${item.type}-${index}`}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#fff"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No events or tasks for today</Text>
                            <Text style={styles.emptySubtext}>Use the Planner to add some!</Text>
                        </View>
                    }
                />
            )}

            <CompletionModal
                visible={modalVisible}
                taskName={selectedTask?.task || ''}
                onSubmit={handleSubmitFeedback}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedTask(null);
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.sizes['3xl'],
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    dateContainer: {
        marginTop: theme.spacing.xs,
    },
    dateText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.textSecondary,
    },
    progressCard: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
    },
    progressText: {
        flex: 1,
    },
    progressTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs / 2,
    },
    progressSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
    },
    loader: {
        marginTop: theme.spacing.xl,
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    eventCard: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.md,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingRight: theme.spacing.md,
        borderRightWidth: 2,
        borderRightColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    timeSeparator: {
        color: theme.colors.textMuted,
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: theme.typography.sizes.base,
        fontWeight: '600',
        color: theme.colors.text,
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
