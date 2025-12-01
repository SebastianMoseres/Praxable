from datetime import datetime, timedelta
from . import calendar_service

def parse_time(iso_string):
    """Converts Google's time format to a Python datetime object."""
    # Google sends time like: '2025-11-26T14:00:00-05:00'
    return datetime.fromisoformat(iso_string)

def get_free_slots():
    """
    Calculates free time slots for the rest of the day.
    """
    # 1. Get Hard Anchors from Google
    events = calendar_service.get_todays_events()
    
    # 2. Define the boundaries of the "Day"
    now = datetime.now().astimezone() # Make sure it's timezone aware
    end_of_day = now.replace(hour=22, minute=0, second=0, microsecond=0) # Assume day ends at 10 PM
    
    # If it's already past 10 PM, no free slots
    if now > end_of_day:
        return []

    # 3. Sort events by start time (Crucial for the logic)
    # We only care about events that end AFTER right now
    future_events = []
    for e in events:
        start = parse_time(e['start'])
        end = parse_time(e['end'])
        if end > now:
            future_events.append((start, end, e['summary']))
    
    # Sort by start time
    future_events.sort(key=lambda x: x[0])

    # 4. The Gap Finding Algorithm
    free_slots = []
    current_pointer = now

    for event_start, event_end, summary in future_events:
        # If there is space between where we are and the next event
        # (We define a usable slot as at least 15 minutes)
        if event_start > current_pointer + timedelta(minutes=15):
            free_slots.append({
                "start": current_pointer.strftime("%H:%M"),
                "end": event_start.strftime("%H:%M"),
                "duration_minutes": int((event_start - current_pointer).total_seconds() / 60)
            })
        
        # Move the pointer to the end of this event
        # (Unless the pointer is already ahead, which handles overlapping events)
        if event_end > current_pointer:
            current_pointer = event_end

    # 5. Check for final slot (after the last event until end of day)
    if end_of_day > current_pointer + timedelta(minutes=15):
        free_slots.append({
            "start": current_pointer.strftime("%H:%M"),
            "end": end_of_day.strftime("%H:%M"),
            "duration_minutes": int((end_of_day - current_pointer).total_seconds() / 60)
        })

    return free_slots