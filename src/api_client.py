import requests
import streamlit as st
import json

# The base URL of our running FastAPI backend.
# This is the address of our "kitchen".
BASE_URL = "http://127.0.0.1:8000"

def get_values():
    """Sends a GET request to the /values endpoint of our API."""
    try:
        response = requests.get(f"{BASE_URL}/values")
        response.raise_for_status()  # This will raise an exception for bad responses (4xx or 5xx)
        # The API returns a list of dictionaries, e.g., [{'value_name': 'Health'}].
        # We need to extract just the string names.
        return [item['value_name'] for item in response.json()]
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return [] # Return an empty list on error

def add_value(value_name: str):
    """Sends a POST request to the /values endpoint to add a new value."""
    try:
        # We need to send the data in the JSON format that our Pydantic model expects.
        payload = {"value_name": value_name}
        response = requests.post(f"{BASE_URL}/values", json=payload)
        response.raise_for_status()
        return response.json() # Return the full response from the server
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return None
    
# ... (after the add_value function)

def delete_value(value_name: str):
    """Sends a DELETE request to the /values/{value_name} endpoint."""
    try:
        # The value is part of the URL itself
        response = requests.delete(f"{BASE_URL}/values/{value_name}")
        response.raise_for_status()
        return True # Return True on success
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return False
    
# ... (at the end of the file)

def generate_plan_from_text(user_input: str, core_values: list):
    """Sends a POST request to the /planner/generate endpoint."""
    try:
        payload = {
            "user_input": user_input,
            "core_values": core_values
        }
        response = requests.post(f"{BASE_URL}/planner/generate", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the AI planner: {e}")
        return None
    
def generate_plan_with_audio(user_input: str, core_values: list, audio_bytes=None):
    """Sends a POST request to the /planner/generate_with_audio endpoint."""
    try:
        # Prepare data for multipart/form-data
        data = {
            "user_input": user_input,
            "core_values": json.dumps(core_values) # Convert list to JSON string
        }
        
        files = {}
        if audio_bytes:
            files["audio_file"] = ("audio.wav", audio_bytes, "audio/wav")
            
        response = requests.post(f"{BASE_URL}/planner/generate_with_audio", data=data, files=files)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the AI planner: {e}")
        return None
    

# ... (at the end of the file)
import pandas as pd # Add pandas to your imports at the top of the file

def get_all_tasks():
    """Fetches all tasks from the API and returns them as a DataFrame."""
    try:
        response = requests.get(f"{BASE_URL}/tasks")
        response.raise_for_status()
        # The API returns a list of dictionaries. Convert it to a DataFrame
        # because our Streamlit UI is already designed to work with one.
        return pd.DataFrame(response.json())
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return pd.DataFrame() # Return an empty DataFrame on error

def log_task(task_dict: dict):
    """Sends a POST request to create a new task."""
    try:
        response = requests.post(f"{BASE_URL}/tasks", json=task_dict)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return None

def update_task_with_feedback(task_id: int, mood_after: int, fulfillment_score: int):
    """Sends a POST request to save feedback for a specific task."""
    try:
        payload = {"mood_after": mood_after, "fulfillment_score": fulfillment_score}
        response = requests.post(f"{BASE_URL}/tasks/{task_id}/feedback", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the API: {e}")
        return None
    

def get_alignment_analytics():
    """Fetches analytics data from the backend."""
    try:
        response = requests.get(f"{BASE_URL}/analytics/alignment")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to analytics API: {e}")
        return None
    
def get_predicted_fulfillment(task_type, aligned_value, energy_level, mood_before):
    """Asks the backend to predict fulfillment for a task."""
    try:
        payload = {
            "task_type": task_type,
            "aligned_value": aligned_value,
            "energy_level": energy_level,
            "mood_before": mood_before
        }
        response = requests.post(f"{BASE_URL}/predict/fulfillment", json=payload)
        if response.status_code == 200:
            return response.json().get("predicted_fulfillment")
        return None
    except Exception:
        return None