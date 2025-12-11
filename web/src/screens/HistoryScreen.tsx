import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { api } from '../services/api';
import { theme } from '../styles/theme';
import type { TaskData, CoreValue } from '../types';

export function HistoryScreen() {
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);
    const [values, setValues] = useState<CoreValue[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [fetchedTasks, fetchedValues] = await Promise.all([
                api.getAllTasks(),
                api.getValues()
            ]);
            setTasks(fetchedTasks);
            setValues(fetchedValues);
        } catch (error) {
            console.error("Failed to load history data", error);
        }
    };

    const handleEditClick = (task: TaskData) => {
        setEditingTask(task);
    };

    const handleSave = async () => {
        if (!editingTask) return;
        setIsLoading(true);
        try {
            await api.updateTask(editingTask.id, {
                mood_after: editingTask.mood_after ?? 5,
                fulfillment_score: editingTask.fulfillment_score ?? 5,
                aligned_value: editingTask.aligned_value
            });

            // Retrain model automatically after update to ensure recommendations adapt
            await api.retrainModel();

            alert("Task updated and AI retrained! 🧠");
            setEditingTask(null);
            loadData(); // Refresh list
        } catch (error) {
            console.error("Failed to update task", error);
            alert("Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>History & Feedback</h1>
                <p style={subtitleStyle}>Review your past activities to teach the AI what fulfills you.</p>
            </header>

            <div style={listStyle}>
                {tasks.map((task) => (
                    <GlassCard key={task.id} style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <span style={dateStyle}>{task.date}</span>
                            <span style={typeStyle}>{task.task_type}</span>
                        </div>

                        <h3 style={taskTitleStyle}>{task.task}</h3>

                        <div style={statsRowStyle}>
                            <div style={statStyle}>
                                <span style={statLabelStyle}>Value:</span>
                                <span style={statValueStyle}>{task.aligned_value}</span>
                            </div>
                            <div style={statStyle}>
                                <span style={statLabelStyle}>Fulfillment:</span>
                                <span style={{
                                    ...statValueStyle,
                                    color: getScoreColor(task.fulfillment_score)
                                }}>
                                    {task.fulfillment_score ? task.fulfillment_score.toString() : '-'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEditClick(task)}
                            style={editButtonStyle}
                        >
                            Edit Feedback
                        </button>
                    </GlassCard>
                ))}
            </div>

            {editingTask && (
                <div style={modalOverlayStyle}>
                    <GlassCard style={modalContentStyle}>
                        <h2 style={modalTitleStyle}>Edit Feedback</h2>
                        <p style={taskTitleStyle}>{editingTask.task}</p>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Aligned Value</label>
                            <select
                                value={editingTask.aligned_value}
                                onChange={(e) => setEditingTask({ ...editingTask, aligned_value: e.target.value })}
                                style={selectStyle}
                            >
                                {values.map(v => (
                                    <option key={v.value_name} value={v.value_name}>{v.value_name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Fulfillment Score (1-10)</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={editingTask.fulfillment_score ?? 5}
                                onChange={(e) => setEditingTask({ ...editingTask, fulfillment_score: parseInt(e.target.value) })}
                                style={inputStyle}
                            />
                            <p style={hintStyle}>Higher means this activity energized you and felt meaningful.</p>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Mood After (1-10)</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={editingTask.mood_after ?? 5}
                                onChange={(e) => setEditingTask({ ...editingTask, mood_after: parseInt(e.target.value) })}
                                style={sliderStyle}
                            />
                            <span style={valueDisplay}>{editingTask.mood_after ?? 5}</span>
                        </div>

                        <div style={modalActionsStyle}>
                            <button onClick={() => setEditingTask(null)} style={cancelButtonStyle}>Cancel</button>
                            <GradientButton
                                title="Save & Retrain AI"
                                onPress={handleSave}
                                loading={isLoading}
                                gradient={theme.colors.gradientSuccess}
                            />
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

const getScoreColor = (score: number | null) => {
    if (score === null) return theme.colors.textMuted;
    if (score >= 8) return theme.colors.success;
    if (score <= 4) return theme.colors.danger;
    return theme.colors.warning;
};

// Styles
const containerStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    maxWidth: '800px',
    margin: '0 auto',
    animation: 'fadeIn 0.5s ease-out',
};

const headerStyle: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
};

const subtitleStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.lg,
};

const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
};

const cardStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
};

const dateStyle: React.CSSProperties = {};
const typeStyle: React.CSSProperties = {
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
};

const taskTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600',
    color: theme.colors.text,
};

const statsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.glassBorder}`,
};

const statStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    alignItems: 'center',
};

const statLabelStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
};

const statValueStyle: React.CSSProperties = {
    fontWeight: '700',
    color: theme.colors.text,
};

const editButtonStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    cursor: 'pointer',
    fontSize: theme.typography.sizes.sm,
    transition: 'background 0.2s',
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
};

const modalContentStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '500px',
    padding: theme.spacing.xl,
};

const modalTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
};

const formGroupStyle: React.CSSProperties = {
    marginBottom: theme.spacing.lg,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
};

const sliderStyle: React.CSSProperties = {
    width: '100%',
    marginRight: theme.spacing.md,
};

const valueDisplay: React.CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
};

const hintStyle: React.CSSProperties = {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
};

const modalActionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
};

const cancelButtonStyle: React.CSSProperties = {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
};
