import { type CSSProperties } from 'react';
import type { Task } from '../types';
import { GlassCard } from './GlassCard';
import { theme } from '../styles/theme';

interface TaskCardProps {
    task: Task;
    showCheckbox?: boolean;
    onComplete?: () => void;
}

export function TaskCard({ task, showCheckbox = false, onComplete }: TaskCardProps) {
    const containerStyle: CSSProperties = {
        marginBottom: theme.spacing.md,
    };

    const headerStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    };

    const taskNameStyle: CSSProperties = {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
        marginRight: theme.spacing.md,
    };

    const metaRowStyle: CSSProperties = {
        display: 'flex',
        gap: theme.spacing.md,
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
    };

    const metaItemStyle: CSSProperties = {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
    };

    const valueBadgeStyle: CSSProperties = {
        background: 'rgba(102, 126, 234, 0.2)',
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.borderRadius.sm,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primary,
        fontWeight: '600',
    };

    const checkboxStyle: CSSProperties = {
        width: '24px',
        height: '24px',
        borderRadius: theme.borderRadius.sm,
        border: `2px solid ${theme.colors.glassBorder}`,
        cursor: 'pointer',
        flexShrink: 0,
    };

    return (
        <div style={containerStyle}>
            <GlassCard>
                <div style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <div style={taskNameStyle}>{task.task_name}</div>
                        <div style={metaRowStyle}>
                            <div style={metaItemStyle}>
                                <span>📝</span>
                                <span>{task.task_type}</span>
                            </div>
                            <div style={metaItemStyle}>
                                <span>⏰</span>
                                <span>{task.time_preference}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: theme.spacing.sm }}>
                            <div style={valueBadgeStyle}>💎 {task.aligned_value}</div>
                        </div>
                    </div>
                    {showCheckbox && (
                        <div
                            style={checkboxStyle}
                            onClick={onComplete}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = theme.colors.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = theme.colors.glassBorder;
                            }}
                        />
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
