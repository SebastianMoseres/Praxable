// API service for connecting to FastAPI backend
import axios from 'axios';

// Use your computer's local IP so phone can connect
// Change this to your deployed backend URL in production
const API_BASE = 'http://192.168.1.6:8000';

// Types
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

// API client
export const api = {
    // Core Values
    getValues: async (): Promise<CoreValue[]> => {
        const response = await axios.get(`${API_BASE}/values`);
        return response.data;
    },

    addValue: async (valueName: string): Promise<CoreValue> => {
        const response = await axios.post(`${API_BASE}/values`, {
            value_name: valueName,
        });
        return response.data;
    },

    // Plan Generation
    generatePlanWithAudio: async (
        audioUri: string | null,
        userInput: string,
        coreValues: string[]
    ): Promise<PlannerResponse> => {
        const formData = new FormData();

        if (audioUri) {
            // @ts-ignore - FormData append with blob works in React Native
            formData.append('audio_file', {
                uri: audioUri,
                type: 'audio/wav',
                name: 'recording.wav',
            });
        }

        formData.append('user_input', userInput);
        formData.append('core_values', JSON.stringify(coreValues));

        const response = await axios.post(
            `${API_BASE}/planner/generate_with_audio`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Calendar
    getCalendarEvents: async (): Promise<CalendarEvent[]> => {
        const response = await axios.get(`${API_BASE}/calendar/today`);
        return response.data;
    },

    addCalendarEvent: async (
        summary: string,
        startTime: string,
        endTime: string
    ): Promise<CalendarEvent> => {
        const response = await axios.post(`${API_BASE}/calendar/events`, {
            summary,
            start: startTime,
            end: endTime,
        });
        return response.data;
    },

    // Tasks
    logTask: async (taskData: any): Promise<void> => {
        await axios.post(`${API_BASE}/tasks`, taskData);
    },

    // Predictions
    getPredictedFulfillment: async (
        taskType: string,
        alignedValue: string,
        energyLevel: number,
        moodBefore: number
    ): Promise<number | null> => {
        const response = await axios.post(`${API_BASE}/predict/fulfillment`, {
            task_type: taskType,
            aligned_value: alignedValue,
            energy_level: energyLevel,
            mood_before: moodBefore,
        });
        return response.data.predicted_fulfillment;
    },

    // Task Management
    getAllTasks: async (): Promise<any[]> => {
        const response = await axios.get(`${API_BASE}/tasks`);
        return response.data;
    },

    completeTask: async (
        taskId: number,
        moodAfter: number,
        fulfillmentScore: number
    ): Promise<void> => {
        await axios.post(`${API_BASE}/tasks/${taskId}/feedback`, {
            mood_after: moodAfter,
            fulfillment_score: fulfillmentScore,
        });
    },

    // Analytics
    getAnalytics: async (): Promise<any> => {
        const response = await axios.get(`${API_BASE}/analytics/alignment`);
        return response.data;
    },

    // Free Time Slots
    getFreeSlots: async (): Promise<FreeSlot[]> => {
        const response = await axios.get(`${API_BASE}/scheduler/free`);
        return response.data;
    },

    // Activity Recommendations
    getActivities: async (): Promise<Activity[]> => {
        const response = await axios.get(`${API_BASE}/recommendations/activities`);
        return response.data;
    },

    getRecommendations: async (
        valueNames: string[],
        minDuration?: number
    ): Promise<Recommendation[]> => {
        const response = await axios.post(`${API_BASE}/recommendations/suggest`, {
            value_names: valueNames,
            min_duration: minDuration || 0,
        });
        return response.data;
    },
};
