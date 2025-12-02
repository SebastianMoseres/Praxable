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
import { Audio } from 'expo-av';
import { api, Task } from '../services/api';

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
            }

            Alert.alert('Success', 'Tasks added to calendar!');
            setTasks([]);
            setUserInput('');
            setAudioUri(null);
        } catch (error) {
            console.error('Failed to approve tasks:', error);
            Alert.alert('Error', 'Failed to save tasks');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Plan Your Day with AI</Text>

            <TextInput
                style={styles.textInput}
                placeholder="What's on your mind for today?"
                multiline={true}
                value={userInput}
                onChangeText={setUserInput}
            />

            <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Text style={styles.recordButtonText}>
                    {isRecording ? '🔴 Stop Recording' : '🎤 Record Your Plan'}
                </Text>
            </TouchableOpacity>

            {audioUri && (
                <Text style={styles.audioConfirm}>✓ Audio recorded</Text>
            )}

            <View style={styles.sliderRow}>
                <View style={styles.sliderContainer}>
                    <Text>Energy: {energy}</Text>
                    <TextInput
                        style={styles.sliderInput}
                        keyboardType="numeric"
                        value={String(energy)}
                        onChangeText={(text) => setEnergy(Number(text) || 6)}
                    />
                </View>
                <View style={styles.sliderContainer}>
                    <Text>Mood: {mood}</Text>
                    <TextInput
                        style={styles.sliderInput}
                        keyboardType="numeric"
                        value={String(mood)}
                        onChangeText={(text) => setMood(Number(text) || 5)}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.generateButton}
                onPress={generatePlan}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.generateButtonText}>Generate Plan</Text>
                )}
            </TouchableOpacity>

            {tasks.length > 0 && (
                <View style={styles.tasksContainer}>
                    <Text style={styles.tasksTitle}>AI-Generated Tasks:</Text>
                    {tasks.map((task, index) => (
                        <View key={index} style={styles.taskCard}>
                            <Text style={styles.taskName}>{task.task_name}</Text>
                            <Text style={styles.taskDetail}>Type: {task.task_type}</Text>
                            <Text style={styles.taskDetail}>Time: {task.time_preference}</Text>
                            <Text style={styles.taskDetail}>Value: {task.aligned_value}</Text>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.approveButton} onPress={approveTasks}>
                        <Text style={styles.approveButtonText}>Approve & Add to Calendar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
    textInput: { backgroundColor: '#fff', padding: 15, borderRadius: 10, fontSize: 16, minHeight: 120, marginBottom: 15 },
    recordButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    recordingButton: { backgroundColor: '#FF3B30' },
    recordButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    audioConfirm: { color: '#34C759', textAlign: 'center', marginBottom: 15 },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    sliderContainer: { flex: 1, marginHorizontal: 5 },
    sliderInput: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginTop: 5 },
    generateButton: { backgroundColor: '#34C759', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    generateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    tasksContainer: { marginTop: 10 },
    tasksTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
    taskName: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
    taskDetail: { fontSize: 14, color: '#666', marginTop: 3 },
    approveButton: { backgroundColor: '#FF9500', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 15 },
    approveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
