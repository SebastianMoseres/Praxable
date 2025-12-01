import requests
import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_get_events():
    print("Testing GET /calendar/today...")
    try:
        response = requests.get(f"{BASE_URL}/calendar/today")
        if response.status_code == 200:
            events = response.json()
            print(f"✅ Success! Found {len(events)} events.")
            for e in events:
                print(f" - {e.get('summary')} ({e.get('start')} to {e.get('end')})")
        else:
            print(f"❌ Failed. Status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_add_event():
    print("\nTesting POST /calendar/events...")
    now = datetime.datetime.now()
    start = (now + datetime.timedelta(hours=1)).isoformat()
    end = (now + datetime.timedelta(hours=2)).isoformat()
    
    payload = {
        "summary": "Test Event from Script",
        "start": start,
        "end": end
    }
    
    try:
        response = requests.post(f"{BASE_URL}/calendar/events", json=payload)
        if response.status_code == 200:
            print("✅ Success! Event created.")
            print(response.json())
        else:
            print(f"❌ Failed. Status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_get_events()
    test_add_event()
