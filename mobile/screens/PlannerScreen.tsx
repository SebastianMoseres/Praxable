import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { TaskCard } from '../components/TaskCard';
import { api, Task } from '../services/api';
import { notificationService } from '../services/notifications';
import { theme } from '../theme';

export default function PlannerScreen() {
    const [userInput, setUserInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [energy, setEnergy] = useState(6);
    const [mood, setMood] = useState(5);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [coreValues, setCoreValues] = useState<string[]>([]);

    React.useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const values = await api.getValues();
            setCoreValues(values.map((v) => v.value_name));
        } catch (error) {
            console.error('Failed to load values:', error);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Please allow microphone access');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
    };

    const generatePlan = async () => {
        if (!userInput && !audioUri) {
            Alert.alert('Input required', 'Please enter text or record audio');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.generatePlanWithAudio(
                audioUri,
                userInput,
                coreValues
            );
            setTasks(response.tasks);
        } catch (error) {
            console.error('Failed to generate plan:', error);
            Alert.alert('Error', 'Failed to generate plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const approveTasks = async () => {
        try {
            for (const task of tasks) {
                await api.logTask({
                    date: new Date().toISOString().split('T')[0],
                    task: task.task_name,
                    task_type: task.task_type,
                    aligned_value: task.aligned_value,
                    planned_time: task.time_preference,
                    energy_level: energy,
                    mood_before: mood,
                    dread_level: 3,
                    location: 'any',
                    actual_time: '00:00',
                    did_it: 0,
                    sleep_quality: 7,
                });

                const now = new Date();
                const [startHour, startMin] = task.time_preference.split(':').map(Number);
                const startTime = new Date(now);
                startTime.setHours(startHour || 12, startMin || 0, 0);
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 1);

                await api.addCalendarEvent(
                    task.task_name,
                    startTime.toISOString(),
                    endTime.toISOString()
                );

                // Schedule notification
                await notificationService.scheduleTaskReminder(
                    task.task_name,
                    task.time_preference
                );
            }

            Alert.alert('Success', 'Tasks added to calendar with reminders!');
            setTasks([]);
            setUserInput('');
            setAudioUri(null);
        } catch (error) {
            console.error('Failed to approve tasks:', error);
            Alert.alert('Error', 'Failed to save tasks');
        }
    };

    return (
        <LinearGradient
            colors={[theme.colors.background, theme.colors.backgroundSecondary]}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>✨ AI Planner</Text>
                <Text style={styles.subtitle}>Plan your day aligned with your values</Text>

                <GlassCard style={styles.inputCard}>
                    <Text style={styles.label}>What's on your mind?</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Describe your goals for today..."
                        placeholderTextColor={theme.colors.textMuted}
                        multiline={true}
                        value={userInput}
                        onChangeText={setUserInput}
                    />
                </GlassCard>

                <GradientButton
                    title={isRecording ? '🔴 Stop Recording' : '🎤 Record Your Plan'}
                    onPress={isRecording ? stopRecording : startRecording}
                    gradient={isRecording ? theme.colors.gradientSecondary : theme.colors.gradientInfo}
                    style={styles.recordButton}
                />

                {audioUri && (
                    <Text style={styles.audioConfirm}>✓ Audio recorded successfully</Text>
                )}

                <GlassCard style={styles.stateCard}>
                    <Text style={styles.sectionTitle}>Current State</Text>
                    <View style={styles.sliderRow}>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>⚡ Energy</Text>
                            <View style={styles.scaleButtons}>
                                {[...Array(10)].map((_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.scaleButton, energy === i + 1 && styles.scaleButtonActive]}
                                        onPress={() => setEnergy(i + 1)}
                                    >
                                        <Text style={[styles.scaleButtonText, energy === i + 1 && styles.scaleButtonTextActive]}>
                                            {i + 1}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>😊 Mood</Text>
                            <View style={styles.scaleButtons}>
                                {[...Array(10)].map((_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.scaleButton, mood === i + 1 && styles.scaleButtonActive]}
                                        onPress={() => setMood(i + 1)}
                                    >
                                        <Text style={[styles.scaleButtonText, mood === i + 1 && styles.scaleButtonTextActive]}>
                                            {i + 1}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </GlassCard>

                <GradientButton
                    title="Generate Plan"
                    onPress={generatePlan}
                    loading={isLoading}
                    gradient={theme.colors.gradientSuccess}
                    style={styles.generateButton}
                />

                {tasks.length > 0 && (
                    <View style={styles.tasksContainer}>
                        <Text style={styles.tasksTitle}>AI-Generated Tasks</Text>
                        {tasks.map((task, index) => (
                            <TaskCard key={index} task={task} showCheckbox={false} />
                        ))}
                        <GradientButton
                            title="Approve & Add to Calendar"
                            onPress={approveTasks}
                            gradient={theme.colors.gradientWarning}
                            style={styles.approveButton}
                        />
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    inputCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: theme.spacing.sm,
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    recordButton: {
        marginBottom: theme.spacing.md,
    },
    audioConfirm: {
        color: theme.colors.success,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        fontSize: theme.typography.sizes.sm,
    },
    stateCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    sliderRow: {
        gap: theme.spacing.lg,
    },
    sliderContainer: {
        marginBottom: theme.spacing.md,
    },
    sliderLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: theme.spacing.sm,
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    generateButton: {
        marginBottom: theme.spacing.lg,
    },
    tasksContainer: {
        marginTop: theme.spacing.md,
    },
    tasksTitle: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    approveButton: {
        marginTop: theme.spacing.md,
    },
});
