import streamlit as st
from datetime import datetime
import pandas as pd

# Import our custom modules from the src directory
from src import data_manager
from src.predictor import Predictor # Import our new Predictor class
from src import nudger # Import our new nudger module



# --- INITIALIZATION ---
# Ensure the database is ready before the app does anything else
data_manager.initialize_database()

# --- MODEL TRAINING ---
# Initialize the predictor object in the session state to keep it loaded
if 'predictor' not in st.session_state:
    st.session_state.predictor = Predictor()

# Load all historical data for training
training_df = data_manager.get_training_data()

# We need at least a few data points to train a model
if not training_df.empty and len(training_df) > 5:
    st.session_state.predictor.train(training_df)
else:
    st.info("Not enough data to train a predictive model yet. Log at least 5 tasks and mark them as done or skipped.")

# --- APP LAYOUT ---
st.title("✅ Praxable: Log Your Intentions")

st.header("What do you plan to do?")

# Create a form for user input
with st.form(key='task_form', clear_on_submit=True):
    task_name = st.text_input("Task Name", placeholder="e.g., Go to the gym")
    
    # --- NEW INPUTS ---
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

# --- FORM PROCESSING ---
if submit_button:
    if not task_name:
        st.warning("Please enter a task name.")
    else:
        new_task = {
            'date': datetime.now().strftime("%Y-%m-%d"),
            'task': task_name,
            # NEW DICT KEYS --
            'task_type': task_type.split(' ')[1], # Store just the word, not the emoji
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
        st.success(f"Successfully logged task: '{task_name}'")

        # --- MAKE AND DISPLAY PREDICTION ---
        if st.session_state.predictor.is_trained:
            # Convert the new task dict into a DataFrame for the model
            new_task_df = pd.DataFrame([new_task])
            
            # Get the probability score
            probability = st.session_state.predictor.predict_probability(new_task_df)
            
            # Display the prediction with a nice metric component
            st.metric(
                label="Predicted Follow-Through Probability",
                value=f"{probability:.0%}",
                help="This is the model's prediction based on your historical patterns."
            )

            # --- GENERATE AND DISPLAY NUDGE (NEW PART) ---
            nudge_message = nudger.generate_nudge(probability, new_task)
            st.info(nudge_message) # st.info displays the message in a nice blue box
            
        st.balloons()

# --- DISPLAY DATA ---
st.divider()
st.header("📋 Your Task Log")

all_tasks_df = data_manager.get_all_tasks()

if all_tasks_df.empty:
    st.info("Your task log is empty. Add a task above to get started!")
else:
    # Iterate through each task and display it with a button
    for index, row in all_tasks_df.iterrows():
        # Use columns for a cleaner layout
        col1, col2 = st.columns([4, 1])

        with col1:
            # Display task name and date
            st.markdown(f"**{row['task']}**")
            st.caption(f"Planned for: {row['date']}")

        with col2:
            # Show a "Mark as Done" button only if the task isn't already done
            if row['did_it'] == 0:
                # We use the task's unique 'id' as the key for the button
                done_button = st.button("Mark as Done", key=f"done_{row['id']}")
                if done_button:
                    # If the button is clicked, update the database
                    data_manager.update_task_as_done(row['id'])
                    # st.rerun() is a special Streamlit command that reloads the page
                    # to instantly show the result of your action.
                    st.rerun()
            else:
                # If the task is done, show a success message
                st.success(f"Done! ✔️")
        
        st.divider() # Add a small line between tasks