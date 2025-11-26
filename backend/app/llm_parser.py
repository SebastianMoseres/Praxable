import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from the .env file in the 'backend' directory
load_dotenv()

def get_structured_plan(user_input, core_values):
    """
    Sends user input and core values to the Gemini model and gets a structured plan back.
    """
    # --- 1. CONFIGURE THE API ---
    try:
        # Load the key from environment variables
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"Error configuring API: {e}")
        return None # Return None on failure

    # --- 2. DEFINE THE MASTER PROMPT ---
    master_prompt = f"""
    You are an expert assistant for the 'Praxable' app, designed to help users plan their day in alignment with their core values.
    Your task is to take the user's raw, natural language text about their plans and convert it into a structured JSON object.

    The user's defined core values are: {', '.join(core_values)}.

    Analyze the user's input below. For each distinct activity you identify, extract the following information:
    - "task_name": A clear, concise name for the activity.
    - "task_type": Categorize it as one of: 'Exercise', 'Deep Work', 'Shallow Work', 'Chore', 'Creative', 'Learning', 'Connection', or 'Relaxation'.
    - "time_preference": Extract any mention of time, like 'morning', 'afternoon', 'evening', or specific times. If none, use "any".
    - "aligned_value": Match the task to the MOST relevant of the user's core values provided above.

    User Input:
    "{user_input}"

    Your response MUST be a JSON object containing a single key "tasks", which is a list of the extracted task objects.
    Do not include any other text, explanations, or markdown formatting in your response. Just the JSON.

    Example Output Format:
    {{
      "tasks": [
        {{
          "task_name": "Work on new song",
          "task_type": "Creative",
          "time_preference": "morning",
          "aligned_value": "Creativity"
        }},
        {{
          "task_name": "Go to the gym",
          "task_type": "Exercise",
          "time_preference": "afternoon",
          "aligned_value": "Health"
        }}
      ]
    }}
    """

    # --- 3. CALL THE GEMINI API ---
    try:
        model = genai.GenerativeModel('gemini-2.5-flash') # Or 'gemini-pro'
        response = model.generate_content(master_prompt)
        
        # --- 4. PARSE THE RESPONSE ---
        json_response_text = response.text.strip().replace('```json', '').replace('```', '')
        structured_data = json.loads(json_response_text)
        return structured_data

    except Exception as e:
        print(f"An error occurred while communicating with the Gemini API: {e}")
        return None