import streamlit as st
import google.generativeai as genai
import json

def get_structured_plan(user_input, core_values):
    """
    Sends user input and core values to the Gemini model and gets a structured plan back.
    """
    # --- 1. CONFIGURE THE API ---
    # We access the secret key stored in Streamlit's secrets management
    try:
        api_key = st.secrets["GEMINI_API_KEY"]
        genai.configure(api_key=api_key)
    except KeyError:
        # Handle the case where the key is not set
        st.error("GEMINI_API_KEY is not set in Streamlit secrets. Please add it.")
        return None

    # --- 2. DEFINE THE MASTER PROMPT ---
    # This is the detailed instruction we give to the AI.
    # It tells the AI its role, the input it will receive, and the exact output format we need.
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
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(master_prompt)
        
        # --- 4. PARSE THE RESPONSE ---
        # Clean up the response to ensure it's valid JSON
        json_response_text = response.text.strip().replace('```json', '').replace('```', '')
        
        # Convert the JSON string into a Python dictionary
        structured_data = json.loads(json_response_text)
        return structured_data

    except Exception as e:
        st.error(f"An error occurred while communicating with the Gemini API: {e}")
        return None