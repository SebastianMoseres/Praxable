import os

# --- PATHS ---
DATA_DIR = "data"
# NEW: Change the database file name
DB_PATH = os.path.join(DATA_DIR, "praxable.db") 

# --- DATA COLUMNS ---
# This list is still useful for reference and for our model later
COLUMNS = [
    'date', 
    'task', 
    'planned_time', 
    'actual_time', 
    'did_it', 
    'mood_before', 
    'sleep_quality', 
    'energy_level'
]

NUDGE_THRESHOLDS = {
    "strong": 0.4,  # Probability below this triggers a strong nudge
    "medium": 0.7   # Probability below this triggers a medium nudge
}