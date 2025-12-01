# RESTORATION GUIDE FOR CALENDAR & VOICE INPUT FEATURES

## Summary
This guide will help restore the calendar integration and voice input features.

## Files Already in Place (Untracked)
✅ `backend/app/calendar_service.py` - Google Calendar API integration
✅ `backend/app/scheduler.py` - Free time slot calculation  
✅ `list_models.py` - Gemini model discovery
✅ `verify_calendar.py` - Calendar API testing

## Changes Applied
✅ `requirements.txt` - Added streamlit-calendar, python-multipart
✅ `frontend_app.py` - Moved set_page_config to top, added calendar import
✅ `backend/setup_calendar.py` - Updated SCOPES for write access

## Remaining Changes Needed

### 1. Update `backend/app/main.py`
Add these imports at the top:
```python
from . import calendar_service
from . import scheduler
```

Add these models after `PredictionResponse`:
```python
class CalendarEvent(BaseModel):
    summary: str
    start: str
    end: str

class FreeSlot(BaseModel):
    start: str
    end: str
    duration_minutes: int
```

Add these endpoints at the end:
```python
@app.get("/calendar/today", response_model=List[CalendarEvent])
async def get_calendar_events():
    """Fetches the hard anchors (events) from Google Calendar for today."""
    events = calendar_service.get_todays_events()
    return events

@app.post("/calendar/events", response_model=CalendarEvent)
async def add_calendar_event(event: CalendarEvent):
    """Adds a new event to the Google Calendar."""
    created_event = calendar_service.add_event(event.summary, event.start, event.end)
    if not created_event:
        raise HTTPException(status_code=500, detail="Failed to create event in Google Calendar")
    return {
        "summary": created_event.get('summary'),
        "start": created_event['start'].get('dateTime'),
        "end": created_event['end'].get('dateTime')
    }
```

Update `/planner/generate` with audio support - see walkthrough.md for details.

### 2. Update `backend/app/llm_parser.py`
Change function signature to:
```python
def get_structured_plan(user_input, core_values, free_slots, audio_file=None):
```

Update model to `gemini-2.0-flash` and add multimodal support - see walkthrough.md.

### 3. Update `src/api_client.py`
Add import: `import json`

Add functions:
```python
def get_calendar_events():
    try:
        response = requests.get(f"{BASE_URL}/calendar/today")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching calendar events: {e}")
        return []

def add_calendar_event(summary, start_time, end_time):
    try:
        payload = {"summary": summary, "start": start_time, "end": end_time}
        response = requests.post(f"{BASE_URL}/calendar/events", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error adding calendar event: {e}")
        return None

def generate_plan_with_audio(user_input: str, core_values: list, audio_bytes=None):
    try:
        data = {"user_input": user_input, "core_values": json.dumps(core_values)}
        files = {}
        if audio_bytes:
            files["audio_file"] = ("audio.wav", audio_bytes, "audio/wav")
        response = requests.post(f"{BASE_URL}/planner/generate_with_audio", data=data, files=files)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error connecting to the AI planner: {e}")
        return None
```

### 4. Update `frontend_app.py`
Add "Calendar" to page navigation (line ~90).
Add voice input widget after text_area (line ~127):
```python
st.write("OR Record your plan:")
audio_value = st.audio_input("Record")
```

Update AI processing to use audio (line ~137).
Change "Approve" to "Approve & Add to Calendar".
Add Calendar page section - see walkthrough.md for full code.

## Quick Apply
For full details, see: `/Users/sebastianmoseres/.gemini/antigravity/brain/2ae7ef35-93e7-440b-81f6-fd30d28ae021/walkthrough.md`
