import { useState, useEffect, type CSSProperties } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { TaskCard } from '../components/TaskCard';
import { api } from '../services/api';
import type { CoreValue, PlannerResponse, Task } from '../types';
import { theme } from '../styles/theme';

export function PlannerScreen() {
    const [userInput, setUserInput] = useState('');
    const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
    const [energy, setEnergy] = useState(5);
    const [mood, setMood] = useState(5);
    const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        loadValues();
    }, []);

    const loadValues = async () => {
        try {
            const values = await api.getValues();
            setCoreValues(values);
        } catch (error) {
            console.error('Failed to load values:', error);
        }
    };

    const startVoiceInput = () => {
        // Check if browser supports Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            } else {
                alert(`Voice recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const generatePlan = async () => {
        if (!userInput.trim()) {
            alert('Please describe what you want to accomplish today');
            return;
        }

        setIsLoading(true);
        try {
            const data: PlannerResponse = await api.generatePlan(
                userInput,
                coreValues.map((v) => v.value_name)
            );
            console.log('Received plan data:', data);
            // Use the correct field from the response
            setGeneratedTasks(data.tasks);
        } catch (error) {
            console.error('Failed to generate plan:', error);
            alert('Failed to generate plan');
        } finally {
            setIsLoading(false);
        }
    };

    const approveTasks = async () => {
        if (generatedTasks.length === 0) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            for (const task of generatedTasks) {
                // Parse time preference (e.g., "19:00 - 20:00")
                const [startTime, endTime] = task.time_preference.split(' - ');
                // Build ISO datetime strings for today with the given times
                const startDateTime = `${today}T${startTime}:00`;
                const endDateTime = `${today}T${endTime}:00`;
                // Add to calendar events
                await api.addCalendarEvent(
                    task.task_name,
                    startDateTime,
                    endDateTime
                );
                // Log the task for tracking and completion
                await api.logTask({
                    date: today,
                    task: task.task_name,
                    task_type: task.task_type,
                    aligned_value: task.aligned_value,
                    dread_level: 0,
                    location: '',
                    planned_time: task.time_preference,
                    actual_time: '',
                    did_it: 0,
                    mood_before: 5,
                    sleep_quality: 5,
                    energy_level: 5,
                });
            }
            alert('Tasks added to your calendar and logged! 🎉');
            setGeneratedTasks([]);
            setUserInput('');

        } catch (error) {
            console.error('Failed to add tasks to calendar:', error);
            alert('Failed to add tasks to calendar');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>✨ AI Task Planner</h1>
                <p style={subtitleStyle}>Let AI help you plan your day aligned with your values</p>
            </div>

            <GlassCard style={inputSectionStyle}>
                <h3 style={sectionTitleStyle}>What do you want to accomplish today?</h3>
                <div style={inputContainerStyle}>
                    <textarea
                        style={textInputStyle}
                        placeholder="E.g., I want to work on my project, exercise, and spend time with family..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        rows={4}
                    />
                    <button
                        style={{
                            ...voiceButtonStyle,
                            ...(isRecording ? voiceButtonRecordingStyle : {}),
                        }}
                        onClick={startVoiceInput}
                        disabled={isRecording}
                    >
                        {isRecording ? '🎙️ Listening...' : '🎤 Voice Input'}
                    </button>
                </div>

                <div style={slidersContainerStyle}>
                    <div style={sliderGroupStyle}>
                        <label style={labelStyle}>⚡ Energy Level: {energy}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={energy}
                            onChange={(e) => setEnergy(Number(e.target.value))}
                            style={sliderStyle}
                        />
                    </div>

                    <div style={sliderGroupStyle}>
                        <label style={labelStyle}>😊 Mood: {mood}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={mood}
                            onChange={(e) => setMood(Number(e.target.value))}
                            style={sliderStyle}
                        />
                    </div>
                </div>

                <GradientButton
                    title="Generate Plan"
                    onPress={generatePlan}
                    loading={isLoading}
                    gradient={theme.colors.gradientPrimary}
                    style={generateButtonStyle}
                />
            </GlassCard>

            {generatedTasks.length > 0 && (
                <section style={tasksSectionStyle}>
                    <h2 style={sectionTitleStyle}>Your Personalized Plan</h2>
                    {generatedTasks.map((task, index) => (
                        <TaskCard key={index} task={task} />
                    ))}

                    <GradientButton
                        title="Add All to Calendar"
                        onPress={approveTasks}
                        gradient={theme.colors.gradientSuccess}
                        style={approveButtonStyle}
                    />
                </section>
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

const inputSectionStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const inputContainerStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const textInputStyle: CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base,
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: theme.spacing.sm,
};

const voiceButtonStyle: CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${theme.animation.normal}`,
};

const voiceButtonRecordingStyle: CSSProperties = {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    animation: 'pulse 1.5s ease-in-out infinite',
};

const slidersContainerStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
};

const sliderGroupStyle: CSSProperties = {
    flex: 1,
    minWidth: '200px',
};

const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
};

const sliderStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    borderRadius: theme.borderRadius.md,
    background: 'rgba(255, 255, 255, 0.1)',
    outline: 'none',
    cursor: 'pointer',
};

const generateButtonStyle: CSSProperties = {
    marginTop: theme.spacing.md,
};

const tasksSectionStyle: CSSProperties = {
    animation: 'fadeIn 0.5s ease-out',
};

const approveButtonStyle: CSSProperties = {
    marginTop: theme.spacing.lg,
};
