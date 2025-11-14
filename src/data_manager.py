import sqlite3
import os
import pandas as pd
from datetime import datetime

# Import our configuration variables
from . import config 

def initialize_database():
    """Creates the data directory and SQLite database with a 'tasks' table if they don't exist."""
    os.makedirs(config.DATA_DIR, exist_ok=True)
    
    # Connect to the database (it will be created if it doesn't exist)
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    
    # Create the 'tasks' table with a schema that matches our columns
    # Using "IF NOT EXISTS" prevents errors on subsequent runs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            task TEXT NOT NULL,
            task_type TEXT,
            
            aligned_value TEXT,      -- NEW: Which core value does this serve?
            
            dread_level INTEGER,
            location TEXT,
            planned_time TEXT,
            actual_time TEXT,
            did_it INTEGER NOT NULL,
            mood_before INTEGER,
            sleep_quality INTEGER,
            energy_level INTEGER,

            mood_after INTEGER,        -- NEW: How did you feel after?
            fulfillment_score INTEGER  -- NEW: Was it energizing or draining?
        )
    ''')

    # --- THE NEW 'values' TABLE ---
    # This table will store the user's core life values
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS core_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value_name TEXT NOT NULL UNIQUE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized with tables for 'tasks' and 'values'.")


# ... (after initialize_database) ...

def get_values():
    """Fetches all user-defined values from the 'values' table."""
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT value_name FROM core_values ORDER BY id")
    values = [row[0] for row in cursor.fetchall()]
    conn.close()
    return values

def add_value(value_name):
    """Adds a new core value to the 'values' table."""
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO core_values (value_name) VALUES (?)", (value_name,))
        conn.commit()
    except sqlite3.IntegrityError:
        print(f"Value '{value_name}' already exists.")
    finally:
        conn.close()

def delete_value(value_name):
    """Deletes a core value from the 'values' table."""
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM core_values WHERE value_name = ?", (value_name,))
    conn.commit()
    conn.close()

# ... (the rest of your functions like log_task, etc.) ...

# def log_task(task_details):
#     """Logs a new task to the SQLite database.
    
#     Args:
#         task_details (dict): A dictionary with keys matching the COLUMNS config.
#     """
#     conn = sqlite3.connect(config.DB_PATH)
#     cursor = conn.cursor()
    
#     # Use a parameterized query to safely insert data
#     # The '?' placeholders prevent SQL injection attacks
#     cursor.execute('''
#         INSERT INTO tasks (
#             date, task, task_type, dread_level, location, 
#             planned_time, actual_time, did_it, 
#             mood_before, sleep_quality, energy_level
#         )
#         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#     ''', (
#         task_details['date'],
#         task_details['task'],
#         # NEW VALUES --
#         task_details['task_type'],
#         task_details['dread_level'],
#         task_details['location'],
        
#         task_details['planned_time'],
#         task_details['actual_time'],
#         task_details['did_it'],
#         task_details['mood_before'],
#         task_details['sleep_quality'],
#         task_details['energy_level']
#     ))
    
#     conn.commit()
#     conn.close()
#     print(f"Logged task to database: {task_details.get('task')}")

def log_task(task_details):
    """Logs a new task to the SQLite database.
    
    Args:
        task_details (dict): A dictionary with keys matching the COLUMNS config.
    """
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (
            date, task, task_type, value_aligned, dread_level, location, 
            planned_time, actual_time, did_it, 
            mood_before, sleep_quality, energy_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        task_details['date'], task_details['task'], task_details['task_type'],
        task_details['aligned_value'], # New field
        task_details['dread_level'], task_details['location'],
        task_details['planned_time'], task_details['actual_time'],
        task_details['did_it'], task_details['mood_before'],
        task_details['sleep_quality'], task_details['energy_level']
    ))
    conn.commit()
    conn.close()
    print(f"Logged task to database: {task_details.get('task')}")


def get_all_tasks():
    """Fetches all tasks from the database and returns them as a Pandas DataFrame."""
    # Connect to the database
    conn = sqlite3.connect(config.DB_PATH)
    
    # Use pandas to execute the query and load data into a DataFrame
    # "ORDER BY id DESC" will show the most recently added tasks first
    df = pd.read_sql_query("SELECT * FROM tasks ORDER BY id DESC", conn)
    
    conn.close()
    
    return df


def update_task_with_feedback(task_id, mood_after, fulfillment_score):
    """Updates a task as done and records the post-task feedback."""
    conn = sqlite3.connect(config.DB_PATH)
    cursor = conn.cursor()
    completion_time = datetime.now().strftime("%H:%M")
    cursor.execute("""
        UPDATE tasks 
        SET did_it = 1, actual_time = ?, mood_after = ?, fulfillment_score = ?
        WHERE id = ?
    """, (completion_time, mood_after, fulfillment_score, task_id))
    conn.commit()
    conn.close()
    print(f"Marked task ID {task_id} as done at {completion_time}.")


def get_training_data():
    """Fetches all tasks suitable for training (i.e., with a 'did_it' outcome).
    For now, this is the same as get_all_tasks, but this could be filtered later."""
    conn = sqlite3.connect(config.DB_PATH)
    # For a robust model, we'd only select tasks where did_it is 1 or 0 and the day has passed.
    # For now, we'll use all data to ensure we have enough to train.
    df = pd.read_sql_query("SELECT * FROM tasks", conn)
    conn.close()
    return df