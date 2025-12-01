import datetime
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Define scopes (must match what we used in setup)
# Define scopes (must match what we used in setup)
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Authenticates and returns the Google Calendar service object."""
    creds = None
    # We assume the token is in the 'backend' folder relative to where we run the script
    token_path = os.path.join("backend", "token.json")
    
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    else:
        print(f"❌ Error: Could not find token.json at {token_path}")
        return None
    
    # Refresh token if expired
    if not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing token: {e}")
                return None
        else:
            print("Token invalid and cannot be refreshed.")
            return None
            
    return build('calendar', 'v3', credentials=creds)

def get_todays_events():
    """Fetches events for the current day."""
    service = get_calendar_service()
    if not service:
        return []
    
    # Get start and end of today
    now = datetime.datetime.now()
    # 'Z' indicates UTC time, which Google expects
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
    end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=0).isoformat() + 'Z'
    
    try:
        events_result = service.events().list(
            calendarId='primary', 
            timeMin=start_of_day,
            timeMax=end_of_day,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Filter and clean the events
        clean_events = []
        for event in events:
            # Skip all-day events (they don't have a specific time block)
            if 'dateTime' not in event['start']:
                continue
                
            clean_events.append({
                "summary": event.get('summary', 'Busy'),
                "start": event['start'].get('dateTime'),
                "end": event['end'].get('dateTime')
            })
            
        return clean_events
    except Exception as e:
        print(f"API Error: {e}")
        return []

def add_event(summary, start_time, end_time):
    """
    Adds an event to the primary calendar.
    start_time and end_time should be ISO format strings.
    """
    service = get_calendar_service()
    if not service:
        return None

    event = {
        'summary': summary,
        'start': {
            'dateTime': start_time,
            'timeZone': 'America/Bogota',
        },
        'end': {
            'dateTime': end_time,
            'timeZone': 'America/Bogota',
        },
    }

    try:
        event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"Event created: {event.get('htmlLink')}")
        return event
    except Exception as e:
        print(f"An error occurred: {e}")
        return None