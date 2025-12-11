// TypeScript type definitions for API responses and data models

export interface CoreValue {
    id?: number;
    value_name: string;
}

export interface Task {
    task_name: string;
    task_type: string;
    time_preference: string;
    aligned_value: string;
}

export interface PlannerResponse {
    tasks: Task[];
}

export interface CalendarEvent {
    summary: string;
    start: string;
    end: string;
}

export interface FreeSlot {
    start: string;
    end: string;
    duration_minutes: number;
}

export interface Activity {
    id: number;
    name: string;
    duration_minutes: number;
    aligned_values: string[];
    description: string;
    category: string;
    emoji: string;
}

export interface Recommendation extends Activity {
    matching_values: string[];
    match_score: number;
    suggested_slot: FreeSlot;
    all_available_slots: FreeSlot[];
}

export interface TaskData {
    id?: number;
    date: string;
    task: string;
    task_type: string;
    aligned_value: string;
    dread_level: number;
    location: string;
    planned_time: string;
    actual_time: string;
    did_it: number;
    mood_before: number;
    mood_after?: number | null;
    fulfillment_score?: number | null;
    sleep_quality: number;
    energy_level: number;
}

export interface ValueBreakdown {
    value_name: string;
    task_count: number;
    avg_fulfillment: number;
}

export interface AnalyticsResponse {
    total_tasks: number;
    breakdown: ValueBreakdown[];
}

export interface PredictionRequest {
    task_type: string;
    aligned_value: string;
    energy_level: number;
    mood_before: number;
}

export interface PredictionResponse {
    predicted_fulfillment: number | null;
}
