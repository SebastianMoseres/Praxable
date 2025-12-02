// API service for connecting to FastAPI backend
import axios from 'axios';

// Use your computer's local IP so phone can connect
// Change this to your deployed backend URL in production
const API_BASE = 'http://192.168.0.145:8000';

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
};
