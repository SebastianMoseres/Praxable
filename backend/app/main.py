from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import json 
import math


# Import the data manager from our app module
# This is correct. It tells Python to look inside the current 'app' package
# for the data_manager and llm_parser modules.
from . import data_manager
from . import llm_parser
from .predictor import predictor
from . import calendar_service
from . import scheduler
from . import recommendations


# --- FastAPI App Initialization ---
app = FastAPI(
    title="Praxable API",
    description="The backend for the Praxable Alignment Engine.",
    version="0.1.0"
)

# --- CORS Middleware Configuration ---
# Allow web app to connect from localhost:5173 (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://localhost:5174",  # Vite dev server (alt port)
        "http://127.0.0.1:5174",  # Alternative localhost (alt port)
        "http://localhost:3000",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# --- App Startup Event ---
# This code runs once when the API server starts up.
# It's the perfect place to initialize our database.
@app.on_event("startup")
def on_startup():
    print("API is starting up...")
    data_manager.initialize_database()
    print("Database initialized.")
    predictor.train()


# --- Pydantic Models for Data Validation ---
# Pydantic enforces data types and validation. This is a key feature of FastAPI.
# It ensures that data sent TO and FROM our API is in the correct format.
class ValueCreate(BaseModel):
    value_name: str

class ValueResponse(BaseModel):
    value_name: str

# ... (after ValueResponse class)

class PlannerRequest(BaseModel):
    user_input: str
    core_values: List[str]

class Task(BaseModel):
    task_name: str
    task_type: str
    time_preference: str
    aligned_value: str

class PlannerResponse(BaseModel):
    tasks: List[Task]

    # ... (after PlannerResponse class)

# Model for creating a task from the manual form
class TaskCreate(BaseModel):
    date: str
    task: str
    task_type: str
    aligned_value: str
    dread_level: int
    location: str
    planned_time: str
    actual_time: str
    did_it: int
    mood_before: int
    sleep_quality: int
    energy_level: int

# Model for representing a task when we send it from the API
# It includes the database ID
class TaskResponse(TaskCreate):
    id: int
    mood_after: int | None = None
    fulfillment_score: int | None = None

# Model for submitting feedback
class TaskFeedback(BaseModel):
    mood_after: int
    fulfillment_score: int

class ValueBreakdown(BaseModel):
    value_name: str
    task_count: int
    avg_fulfillment: float

class AnalyticsResponse(BaseModel):
    total_tasks: int
    breakdown: List[ValueBreakdown]

class PredictionRequest(BaseModel):
    task_type: str
    aligned_value: str
    energy_level: int
    mood_before: int

class PredictionResponse(BaseModel):
    predicted_fulfillment: float | None

class CalendarEvent(BaseModel):
    summary: str
    start: str
    end: str

class FreeSlot(BaseModel):
    start: str
    end: str
    duration_minutes: int

class ActivityResponse(BaseModel):
    id: int
    name: str
    duration_minutes: int
    aligned_values: List[str]
    description: str
    category: str
    emoji: str

class RecommendationRequest(BaseModel):
    value_names: List[str]
    min_duration: int = 0

class RecommendationResponse(BaseModel):
    id: int
    name: str
    duration_minutes: int
    aligned_values: List[str]
    description: str
    category: str
    emoji: str
    matching_values: List[str]
    match_score: int
    predicted_fulfillment: float | None = None
    suggested_slot: FreeSlot
    all_available_slots: List[FreeSlot]

# --- API Endpoints for Core Values ---

# GET endpoint to fetch all values
@app.get("/values", response_model=List[ValueResponse])
async def get_all_values():
    """
    Retrieves a list of all user-defined core values.
    """
    values = data_manager.get_values()
    # We must convert the list of strings into a list of ValueResponse objects
    # to match the response_model.
    return [{"value_name": v} for v in values]


# POST endpoint to add a new value
@app.post("/values", response_model=ValueResponse, status_code=201)
async def add_new_value(value: ValueCreate):
    """
    Adds a new core value to the database.
    """
    try:
        data_manager.add_value(value.value_name)
        return {"value_name": value.value_name}
    except Exception as e:
        # This is basic error handling. If something goes wrong, we send a
        # descriptive error message back to the client.
        raise HTTPException(status_code=400, detail=str(e))
    
# ... (after the @app.post("/values") function)

@app.delete("/values/{value_name}", status_code=204)
async def delete_existing_value(value_name: str):
    """
    Deletes a core value from the database.
    The value to delete is passed in the URL path.
    """
    try:
        data_manager.delete_value(value_name)
        # HTTP 204 means "No Content". It's a standard successful response for a DELETE
        # request that doesn't need to return anything.
        return None
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/planner/generate", response_model=PlannerResponse)
async def generate_plan(request: PlannerRequest):
    """
    1. Gets free time slots from Google Calendar.
    2. Sends user text + free slots to AI.
    3. Returns a schedule that fits the user's life.
    """
    # 1. Get Real-Time Availability
    free_slots = scheduler.get_free_slots()
    
    # 2. Call AI with context
    plan = llm_parser.get_structured_plan(
        user_input=request.user_input, 
        core_values=request.core_values,
        free_slots=free_slots # Pass the slots here
    )
    
    if not plan or "tasks" not in plan:
        raise HTTPException(status_code=500, detail="AI failed to generate a valid plan.")
    
    return plan

from fastapi import UploadFile, File, Form

@app.post("/planner/generate_with_audio", response_model=PlannerResponse)
async def generate_plan_with_audio(
    audio_file: UploadFile = File(None),
    user_input: str = Form(""),
    core_values: str = Form(...) # Expecting a JSON string of values
):
    """
    Generates a plan from audio and/or text input.
    """
    # Parse core_values from JSON string
    try:
        values_list = json.loads(core_values)
    except:
        values_list = []

    # Read audio file bytes if present
    audio_bytes = None
    if audio_file:
        audio_bytes = await audio_file.read()

    # Get free slots for context
    free_slots = scheduler.get_free_slots()

    # Call AI
    plan = llm_parser.get_structured_plan(
        user_input=user_input,
        core_values=values_list,
        free_slots=free_slots,
        audio_file=audio_bytes
    )
    
    if not plan or "tasks" not in plan:
        raise HTTPException(status_code=500, detail="AI failed to generate a valid plan.")
    
    return plan

# ... (at the end of the file)
import pandas as pd # Add pandas to your imports at the top of the file

# --- API Endpoints for Tasks ---


@app.get("/tasks", response_model=List[TaskResponse])
async def get_all_tasks_endpoint():
    """Retrieves all tasks from the database."""
    tasks_df = data_manager.get_all_tasks()
    
    # --- THE PLATINUM FIX ---
    # We use the JSON library to sanitize the data.
    # df.to_json() automatically converts NaN to null.
    # json.loads() automatically converts null to None.
    # This guarantees Pydantic gets exactly what it wants.
    return json.loads(tasks_df.to_json(orient="records"))

@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task_endpoint(task: TaskCreate):
    """Creates a new task in the database."""
    task_dict = task.model_dump()
    
    # Log to database (data_manager.log_task expects a dict)
    data_manager.log_task(task_dict)
    
    # Return the created task with an ID
    import time
    task_dict['id'] = int(time.time() * 1000)
    task_dict['mood_after'] = None
    task_dict['fulfillment_score'] = None
    return task_dict

@app.post("/tasks/{task_id}/feedback", response_model=TaskResponse, status_code=200)
async def save_task_feedback_endpoint(task_id: int, feedback: TaskFeedback):
    """Updates a task as 'done' and saves the post-task feedback."""
    data_manager.update_task_with_feedback(
        task_id=task_id,
        mood_after=feedback.mood_after,
        fulfillment_score=feedback.fulfillment_score
    )
    return {"message": "Feedback submitted successfully"} # A real app would return the updated task

# ... (at the end of file)

@app.get("/analytics/alignment", response_model=AnalyticsResponse)
async def get_alignment_analytics():
    """
    Calculates statistics on how tasks align with core values.
    """
    # 1. Get all data
    df = data_manager.get_all_tasks()

    if df.empty:
        return {"total_tasks": 0, "breakdown": []}

    # 2. Ensure numeric columns are numbers (just in case)
    df['fulfillment_score'] = pd.to_numeric(df['fulfillment_score'], errors='coerce').fillna(0)

    # 3. Group by 'aligned_value'
    # We count tasks and calculate average fulfillment for each value
    stats = df.groupby('aligned_value').agg(
        task_count=('id', 'count'),
        avg_fulfillment=('fulfillment_score', 'mean')
    ).reset_index()

    # 4. Format data for Pydantic
    breakdown = []
    for _, row in stats.iterrows():
        breakdown.append({
            "value_name": row['aligned_value'],
            "task_count": int(row['task_count']),
            "avg_fulfillment": float(row['avg_fulfillment'])
        })

    return {
        "total_tasks": len(df),
        "breakdown": breakdown
    }

@app.post("/predict/fulfillment", response_model=PredictionResponse)
async def predict_fulfillment(request: PredictionRequest):
    """
    Predicts the fulfillment score for a potential task.
    """
    score = predictor.predict(
        task_type=request.task_type,
        aligned_value=request.aligned_value,
        energy_level=request.energy_level,
        mood_before=request.mood_before
    )
    return {"predicted_fulfillment": score}


@app.get("/calendar/today", response_model=List[CalendarEvent])
async def get_calendar_events():
    """Fetches the hard anchors (events) from Google Calendar for today."""
    events = calendar_service.get_todays_events()
    return events

@app.get("/scheduler/free", response_model=List[FreeSlot])
async def get_free_time():
    """Calculates the available free time slots for the rest of the day."""
    return scheduler.get_free_slots()

@app.post("/calendar/events", response_model=CalendarEvent)
async def add_calendar_event(event: CalendarEvent):
    """Adds a new event to the Google Calendar."""
    created_event = calendar_service.add_event(event.summary, event.start, event.end)
    if not created_event:
        raise HTTPException(status_code=500, detail="Failed to create event in Google Calendar")
    
    # Return the created event structure
    return {
        "summary": created_event.get('summary'),
        "start": created_event['start'].get('dateTime'),
        "end": created_event['end'].get('dateTime')
    }

# --- API Endpoints for Activity Recommendations ---

@app.get("/recommendations/activities", response_model=List[ActivityResponse])
async def get_all_activities_endpoint():
    """Fetches all available activities from the activity database."""
    activities = recommendations.get_all_activities()
    return activities

@app.post("/recommendations/suggest", response_model=List[RecommendationResponse])
@app.post("/recommendations/suggest", response_model=List[RecommendationResponse])
async def get_activity_recommendations(request: RecommendationRequest):
    """
    Generates personalized activity recommendations based on user values and free time.
    Uses ML predictor to adaptively score activities.
    """
    # Context for prediction (optional in request, defaulting for now)
    # Ideally should come from request if we want real-time adaptation
    context = {
        "energy_level": 5, # Default or fetch from recent user state
        "mood_before": 5
    }
    
    recommendations_list = recommendations.get_recommendations(
        value_names=request.value_names,
        min_duration=request.min_duration,
        predictor=predictor,
        context=context
    )
    return recommendations_list

# --- API Endpoints for History & Retraining ---

class TaskUpdate(BaseModel):
    mood_after: int | None = None
    fulfillment_score: int | None = None
    aligned_value: str | None = None

@app.patch("/tasks/{task_id}", status_code=200)
async def update_task(task_id: int, updates: TaskUpdate):
    """Updates a task's details."""
    update_dict = updates.model_dump(exclude_unset=True)
    data_manager.update_task_details(task_id, update_dict)
    return {"message": "Task updated successfully"}

@app.post("/predict/retrain", status_code=200)
async def retrain_model():
    """Triggers a manual retraining of the ML model."""
    predictor.train()
    return {"message": "Model retraining triggered", "is_trained": predictor.is_trained}

# --- API Endpoints for Configuration ---


# --- API Endpoints for Configuration ---

class ConfigRequest(BaseModel):
    api_key: str

@app.get("/config/status")
async def get_config_status():
    """Checks if the API key is configured."""
    import os
    from dotenv import load_dotenv
    
    # Reload env to be sure
    load_dotenv(override=True)
    
    api_key = os.getenv("GEMINI_API_KEY")
    return {"is_configured": bool(api_key), "key_preview": api_key[:4] + "..." if api_key else None}

@app.post("/config/api-key")
async def set_api_key(config: ConfigRequest):
    """Sets the API key in the .env file and environment."""
    import os
    from dotenv import load_dotenv
    
    if not config.api_key.startswith("AIza"):
        # Basic validation for Google API keys
        raise HTTPException(status_code=400, detail="Invalid API Key format. Should start with 'AIza'.")

    # 1. Update current environment
    os.environ["GEMINI_API_KEY"] = config.api_key
    
    # 2. Persist to .env file
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    
    # Read existing lines
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
            
    # Filter out existing key
    lines = [line for line in lines if not line.strip().startswith("GEMINI_API_KEY=")]
    
    # Add new key
    lines.append(f"GEMINI_API_KEY={config.api_key}\n")
    
    with open(env_path, "w") as f:
        f.writelines(lines)
        
    # Reload specific modules that rely on it
    import google.generativeai as genai
    genai.configure(api_key=config.api_key)
    
    return {"status": "success", "message": "API Key updated successfully"}