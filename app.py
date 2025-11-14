import streamlit as st
from datetime import datetime
import pandas as pd

# Import our custom modules
from src import data_manager

# --- PAGE CONFIGURATION ---
# Set the page title and a wider layout for the dashboard feel
st.set_page_config(layout="wide", page_title="Praxable: The Alignment Engine")

# --- INITIALIZATION ---
# This runs once and ensures our database and tables are ready
data_manager.initialize_database()


# --- SIDEBAR NAVIGATION ---
# This creates a navigation panel on the left
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Define Your Values", "Log & Review"])


# =====================================================================================
# --- PAGE 1: DEFINE YOUR VALUES ---
# =====================================================================================
if page == "Define Your Values":
    st.title("🧭 Define Your Core Values")
    st.markdown("Your values are the compass for your life. Define 3-5 core values that are most important to you. Every task you log will be aligned with one of these.")

    # --- Input form to add a new value ---
    with st.form(key="value_form", clear_on_submit=True):
        new_value = st.text_input("Enter a new core value (e.g., Health, Growth, Creativity):")
        submit_button = st.form_submit_button(label="Add Value")

        if submit_button and new_value:
            data_manager.add_value(new_value)
            st.success(f"Added value: '{new_value}'")

    # --- Display and manage existing values ---
    st.divider()
    st.subheader("Your Current Values")
    
    current_values = data_manager.get_values()

    if not current_values:
        st.info("You haven't added any values yet. Add one above to get started.")
    else:
        # We display values in columns for a clean look, with a delete button for each
        for i in range(0, len(current_values), 4):
            cols = st.columns(4)
            for j in range(4):
                if i + j < len(current_values):
                    value = current_values[i+j]
                    with cols[j]:
                        st.button(f"❌ {value}", key=f"del_{value}", on_click=data_manager.delete_value, args=(value,))


# =====================================================================================
# --- PAGE 2: LOG & REVIEW ---
# =====================================================================================
elif page == "Log & Review":
    st.title("✅ Praxable: Log Your Intentions")

    # --- Step 1: Check if values are defined ---
    current_values = data_manager.get_values()
    if not current_values:
        st.warning("Please go to the 'Define Your Values' page and add at least one core value before logging a task.")
        st.stop() # Stops the rest of the page from loading

    # --- The new and improved logging form ---
    st.header("What do you plan to do?")
    with st.form(key='task_form', clear_on_submit=True):
        task_name = st.text_input("Task Name", placeholder="e.g., Go for a run")
        
        # NEW: The alignment dropdown, populated from our database
        aligned_value = st.selectbox("Which value does this task align with?", current_values)

        col1, col2 = st.columns(2)
        with col1:
            task_type = st.selectbox("Task Type", ['💪 Exercise', '🧠 Deep Work', '🧹 Chore', '🎨 Creative', '📖 Learning', 'Shallow Work'])
        with col2:
            location = st.selectbox("Location", ['🏡 Home', '🏢 Office', '🏋️ Gym', '☕️ Cafe', '🌳 Outside'])
        
        dread_level = st.slider("Dread Level (1 = excited, 10 = dreading)", 1, 10, 3)
        st.divider()
        st.subheader("Initial State")
        col1, col2, col3 = st.columns(3)
        with col1:
            mood = st.slider("Mood Before", 1, 10, 5)
        with col2:
            sleep = st.slider("Sleep Quality", 1, 10, 7)
        with col3:
            energy = st.slider("Energy Level", 1, 10, 6)
        
        submit_button = st.form_submit_button(label='Log Task')

    # --- Form processing logic ---
    if submit_button and task_name:
        new_task = {
            'date': datetime.now().strftime("%Y-%m-%d"),
            'task': task_name,
            'task_type': task_type.split(' ')[1],
            'aligned_value': aligned_value, # Saving the selected value
            'dread_level': dread_level,
            'location': location.split(' ')[1],
            'planned_time': '00:00',
            'actual_time': '00:00',
            'did_it': 0,
            'mood_before': mood,
            'sleep_quality': sleep,
            'energy_level': energy
        }
        data_manager.log_task(new_task)
        st.success(f"Successfully logged task: '{task_name}' aligned with '{aligned_value}'")
    
    # --- Display the interactive task log ---
    st.divider()
    st.header("📋 Your Task Log")
    
    all_tasks_df = data_manager.get_all_tasks()

    if all_tasks_df.empty:
        st.info("Your task log is empty. Add a task above to get started!")
    else:
        # We iterate through each task to display it
        for index, row in all_tasks_df.iterrows():
            if row['did_it'] == 0: # Task is pending
                with st.expander(f"PENDING: {row['task']} ({row['aligned_value']})"):
                    st.write(f"Logged on: {row['date']}")
                    
                    # This is the new feedback form, nested inside an expander
                    with st.form(key=f"feedback_form_{row['id']}"):
                        st.subheader("Post-Task Check-in")
                        mood_after = st.slider("How do you feel AFTER completing this?", 1, 10, 5, key=f"mood_{row['id']}")
                        fulfillment_score = st.slider("Did this ENERGIZE or DRAIN you?", 1, 10, 5, key=f"fulfill_{row['id']}", help="1=Drained, 10=Energized")
                        
                        submitted = st.form_submit_button("Mark as Done")
                        if submitted:
                            data_manager.update_task_with_feedback(row['id'], mood_after, fulfillment_score)
                            st.success("Feedback saved! Great job.")
                            st.rerun() # Rerun to update the UI
            else: # Task is completed
                st.success(f"DONE: {row['task']} (Fulfillment: {row['fulfillment_score']}/10)")