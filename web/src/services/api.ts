// API service for connecting to FastAPI backend
import axios from 'axios';
import type {
    CoreValue,
    PlannerResponse,
    CalendarEvent,
    FreeSlot,
    Activity,
    Recommendation,
    TaskData,
    AnalyticsResponse,
} from '../types';

// Use environment variable or default to localhost (IPv4 explicit)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
console.log('API Service initialized with base URL:', API_BASE);

// API client with all endpoints
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

    deleteValue: async (valueName: string): Promise<void> => {
        await axios.delete(`${API_BASE}/values/${valueName}`);
    },

    // Plan Generation (text only for web - no audio)
    generatePlan: async (userInput: string, coreValues: string[]): Promise<PlannerResponse> => {
        const response = await axios.post(`${API_BASE}/planner/generate`, {
            user_input: userInput,
            core_values: coreValues,
        });
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

    // Free Time Slots
    getFreeSlots: async (): Promise<FreeSlot[]> => {
        const response = await axios.get(`${API_BASE}/scheduler/free`);
        return response.data;
    },

    // Tasks
    logTask: async (taskData: Partial<TaskData>): Promise<void> => {
        await axios.post(`${API_BASE}/tasks`, taskData);
    },

    getAllTasks: async (): Promise<TaskData[]> => {
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
    getAnalytics: async (): Promise<AnalyticsResponse> => {
        const response = await axios.get(`${API_BASE}/analytics/alignment`);
        return response.data;
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

    // Configuration
    getConfigStatus: async (): Promise<{ is_configured: boolean; key_preview: string | null }> => {
        const response = await axios.get(`${API_BASE}/config/status`);
        return response.data;
    },

    setApiKey: async (apiKey: string): Promise<void> => {
        await axios.post(`${API_BASE}/config/api-key`, {
            api_key: apiKey,
        });
    },

    // History & ML
    updateTask: async (
        taskId: number,
        updates: {
            mood_after?: number;
            fulfillment_score?: number;
            aligned_value?: string
        }
    ): Promise<void> => {
        await axios.patch(`${API_BASE}/tasks/${taskId}`, updates);
    },

    retrainModel: async (): Promise<void> => {
        await axios.post(`${API_BASE}/predict/retrain`);
    },
};
