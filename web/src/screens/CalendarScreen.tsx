import { useState, useEffect, type CSSProperties } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api } from '../services/api';
import type { CalendarEvent, FreeSlot, TaskData } from '../types';
import { theme } from '../styles/theme';

export function CalendarScreen() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
    const [moodAfter, setMoodAfter] = useState(5);
    const [fulfillment, setFulfillment] = useState(5);

    useEffect(() => {
        loadCalendarData();
    }, []);

    const loadCalendarData = async () => {
        setIsLoading(true);
        try {
            const [eventsData, slotsData, tasksData] = await Promise.all([
                api.getCalendarEvents(),
                api.getFreeSlots(),
                api.getAllTasks(),
            ]);
            setEvents(eventsData);
            setFreeSlots(slotsData);
            // Filter to today's tasks
            const today = new Date().toISOString().split('T')[0];
            setTasks(tasksData.filter(t => t.date === today));
        } catch (error) {
            console.error('Failed to load calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        try {
            if (!isoString) return 'N/A';

            // Check if it's just a time string like "13:28" (HH:MM format)
            if (/^\d{1,2}:\d{2}$/.test(isoString)) {
                // Parse as time-only and format to 12-hour
                const [hours, minutes] = isoString.split(':').map(Number);
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }

            // Otherwise treat as ISO datetime
            const date = new Date(isoString);
            if (isNaN(date.getTime())) {
                return 'Invalid time';
            }
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } catch {
            return 'Invalid time';
        }
    };

    const handleTaskComplete = (task: TaskData) => {
        setSelectedTask(task);
        setMoodAfter(5);
        setFulfillment(5);
    };

    const submitFeedback = async () => {
        if (!selectedTask || !selectedTask.id) return;
        try {
            await api.completeTask(selectedTask.id, moodAfter, fulfillment);
            alert('Task completed! Great job! 🎉');
            setSelectedTask(null);
            await loadCalendarData();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>📅 Today's Schedule</h1>
                <p style={subtitleStyle}>Your events, tasks, and free time for today</p>
            </div>

            {isLoading ? (
                <div style={loadingStyle}>Loading...</div>
            ) : (
                <>
                    {/* Today's Tasks */}
                    {tasks.length > 0 && (
                        <section style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>Today's Tasks</h2>
                            {tasks.map((task, index) => (
                                <GlassCard key={index} style={taskCardStyle}>
                                    <div style={taskContentStyle}>
                                        <div style={{ flex: 1 }}>
                                            <div style={taskNameStyle}>{task.task}</div>
                                            <div style={taskMetaStyle}>
                                                💎 {task.aligned_value} • ⏰ {task.planned_time}
                                            </div>
                                        </div>
                                        {task.did_it === 0 ? (
                                            <GradientButton
                                                title="Complete"
                                                onPress={() => handleTaskComplete(task)}
                                                gradient={theme.colors.gradientSuccess}
                                                style={completeButtonStyle}
                                            />
                                        ) : (
                                            <div style={completedBadgeStyle}>✓ Done</div>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </section>
                    )}

                    {/* Calendar Events */}
                    <section style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>Calendar Events</h2>
                        {events.length === 0 ? (
                            <GlassCard>
                                <p style={emptyTextStyle}>No events scheduled for today</p>
                            </GlassCard>
                        ) : (
                            events.map((event, index) => (
                                <GlassCard key={index} style={eventCardStyle}>
                                    <div style={eventContentStyle}>
                                        <div>
                                            <div style={eventTitleStyle}>{event.summary}</div>
                                            <div style={eventTimeStyle}>
                                                {formatTime(event.start)} - {formatTime(event.end)}
                                            </div>
                                        </div>
                                        <div style={eventIconStyle}>📌</div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </section>

                    {/* Free Time Slots */}
                    <section style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>Free Time Slots</h2>
                        {freeSlots.length === 0 ? (
                            <GlassCard>
                                <p style={emptyTextStyle}>No free time slots available</p>
                            </GlassCard>
                        ) : (
                            freeSlots.map((slot, index) => (
                                <GlassCard key={index} style={slotCardStyle}>
                                    <div style={slotContentStyle}>
                                        <div>
                                            <div style={slotTimeStyle}>
                                                {formatTime(slot.start)} - {formatTime(slot.end)}
                                            </div>
                                            <div style={slotDurationStyle}>
                                                {slot.duration_minutes} minutes available
                                            </div>
                                        </div>
                                        <div style={freeIconStyle}>⏰</div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </section>
                </>
            )}

            {/* Completion Modal */}
            {selectedTask && (
                <div style={modalOverlayStyle} onClick={() => setSelectedTask(null)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <GlassCard variant="strong" style={modalContentStyle}>
                            <h3 style={modalTitleStyle}>Task Completed! 🎉</h3>
                            <p style={modalSubtitleStyle}>{selectedTask.task}</p>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>😊 How do you feel now? ({moodAfter})</label>
                                <div style={scaleButtonsStyle}>
                                    {[...Array(10)].map((_, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                ...scaleButtonStyle,
                                                ...(moodAfter === i + 1 ? scaleButtonActiveStyle : {}),
                                            }}
                                            onClick={() => setMoodAfter(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>⭐ How fulfilling was this? ({fulfillment})</label>
                                <div style={scaleButtonsStyle}>
                                    {[...Array(10)].map((_, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                ...scaleButtonStyle,
                                                ...(fulfillment === i + 1 ? scaleButtonActiveStyle : {}),
                                            }}
                                            onClick={() => setFulfillment(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={buttonContainerStyle}>
                                <GradientButton
                                    title="Submit"
                                    onPress={submitFeedback}
                                    gradient={theme.colors.gradientSuccess}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    style={cancelButtonStyle}
                                    onClick={() => setSelectedTask(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
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

const loadingStyle: CSSProperties = {
    textAlign: 'center',
    padding: theme.spacing['3xl'],
    color: theme.colors.textSecondary,
};

const sectionStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const sectionTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
};

const taskCardStyle: CSSProperties = {
    marginBottom: theme.spacing.md,
    background: 'rgba(102, 126, 234, 0.1)',
    animation: 'slideIn 0.3s ease-out',
};

const taskContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
};

const taskNameStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const taskMetaStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
};

const completeButtonStyle: CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.sizes.sm,
};

const completedBadgeStyle: CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.text,
};

const eventCardStyle: CSSProperties = {
    marginBottom: theme.spacing.md,
    background: 'rgba(102, 126, 234, 0.1)',
    animation: 'slideIn 0.3s ease-out',
};

const eventContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const eventTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const eventTimeStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
};

const eventIconStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
};

const slotCardStyle: CSSProperties = {
    marginBottom: theme.spacing.md,
    background: 'rgba(56, 239, 125, 0.1)',
    animation: 'slideIn 0.3s ease-out',
};

const slotContentStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const slotTimeStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const slotDurationStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success,
    fontWeight: '600',
};

const freeIconStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
};

const emptyTextStyle: CSSProperties = {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.lg,
};

const modalOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out',
};

const modalContentStyle: CSSProperties = {
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease-out',
};

const modalTitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const modalSubtitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
};

const formGroupStyle: CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const labelStyle: CSSProperties = {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    display: 'block',
};

const scaleButtonsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
};

const scaleButtonStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.colors.glassBorder}`,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${theme.animation.normal}`,
};

const scaleButtonActiveStyle: CSSProperties = {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: theme.colors.text,
};

const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
};

const cancelButtonStyle: CSSProperties = {
    flex: 1,
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.colors.glassBorder}`,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${theme.animation.normal}`,
};
