import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from the .env file in the 'backend' directory
load_dotenv()

def get_structured_plan(user_input, core_values, free_slots, audio_file=None):
    """
    Sends user input, core values, AND free time slots to the AI.
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"Error configuring API: {e}")
        return None

    # Format free slots into a readable string for the AI
    slots_text = "\n".join([
        f"- {s['start']} to {s['end']} ({s['duration_minutes']} mins)" 
        for s in free_slots
    ])

    master_prompt = f"""
    You are an expert planning assistant for the 'Praxable' app.
    
    CONTEXT:
    1. User's Core Values: {', '.join(core_values)}
    2. User's Input (Intentions): "{user_input}"
    3. **AVAILABLE FREE TIME SLOTS (Do not schedule outside these):**
    {slots_text}

    INSTRUCTIONS:
    Analyze the user's input (text or audio) to identify tasks.
    For each task, assign it to one of the Available Free Time Slots.
    - If a task takes 2 hours, find a slot that is at least 120 mins.
    - If the user specifies a time (e.g., "at 5pm"), try to fit it in the corresponding slot.
    - If no time is specified, pick the most logical slot based on the task type.
    - If audio is provided, prioritize the audio content.

    OUTPUT FORMAT (JSON ONLY):
    {{
      "tasks": [
        {{
          "task_name": "String",
          "task_type": "Category",
          "aligned_value": "Value Name",
          "time_preference": "HH:MM - HH:MM" (The specific time you chose from the slots)
        }}
      ]
    }}
    
    Do not include markdown formatting. Return raw JSON.
    """

    try:
        # Use Gemini 2.0 Flash which supports multimodal input
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        content = [master_prompt]
        if audio_file:
            # audio_file is expected to be bytes
            blob = {'mime_type': 'audio/wav', 'data': audio_file}
            content.append(blob)

        response = model.generate_content(content)
        
        json_response_text = response.text.strip().replace('```json', '').replace('```', '')
        structured_data = json.loads(json_response_text)
        return structured_data

    except Exception as e:
        print(f"AI Error: {e}")
        return None