import streamlit as st
from datetime import datetime
import pandas as pd

# --- Internal Modules ---
# We ONLY import the api_client. The frontend never touches the data_manager.
from src import api_client

st.markdown("""
<style>
    /* GLOBAL LAYOUT */
    .main > div {
        padding-top: 4rem;
        padding-left: 2rem;
        padding-right: 2rem;
        background-color: #1e1e1e;
        color: white;
    }
    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        background-color: #1e1e1e;
        color: white;
    }
    h1, h2, h3 {
        font-weight: 700 !important;
        letter-spacing: -0.5px;
        color: white;
    }
    h1 {
        margin-bottom: 0.3rem;
        margin-top: 2rem !important;
    }
    .block-container {
        max-width: 1100px;
        margin: 0 auto;
        background-color: #2a2a2a;
        border-radius: 0.75rem;
        padding: 1rem;
    }
    div[data-testid="stExpander"] {
        border-radius: 0.75rem;
        border: 1px solid #444444;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        overflow: hidden;
    }
    .stTextInput > div > div,
    .stSelectbox > div > div,
    .stTextArea > div > textarea,
    .stSlider > div {
        border-radius: 0.6rem !important;
        background-color: #3a3a3a;
        color: white;
    }
    .stButton>button {
        background-color: #4B6FFF;
        color: white;
        border-radius: 0.6rem;
        border: none;
        padding: 0.6rem 1.1rem;
        font-weight: 600;
        box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
        transition: all 0.15s ease;
    }
    .stButton>button:hover {
        background-color: #3856e6;
        transform: translateY(-1px);
    }
    section[data-testid="stSidebar"] {
        background-color: #2a2a2a;
        border-right: 1px solid #444444;
    }
    section[data-testid="stSidebar"] * {
        color: #E8E9EB !important;
    }
    .stApp header {
        background: linear-gradient(90deg, #4B6FFF, #6A85FF);
        height: 6px;
    }
</style>
""", unsafe_allow_html=True)

# =====================================================================================
# PAGE CONFIGURATION
# =====================================================================================
st.set_page_config(
    page_title="Praxable: The Alignment Engine",
    layout="wide"
)

# NOTE: We REMOVED data_manager.initialize_database() here.
# The backend API handles that now.

# =====================================================================================
# SIDEBAR NAVIGATION
# =====================================================================================
st.sidebar.title("Navigation")
page = st.sidebar.radio(
    "Go to",
    ["Plan Your Day with AI", "Log & Review", "Dashboard", "Define Your Values"]
)

# =====================================================================================
# PAGE 1 — PLAN YOUR DAY WITH AI
# =====================================================================================
if page == "Plan Your Day with AI":
    st.title("🤖 Plan Your Day with AI")
    st.markdown(
        "Describe your day in natural language. "
        "The AI will structure it, align it with your values, and prepare it for logging."
    )

    # Ensure values exist via API
    current_values = api_client.get_values()
    if not current_values:
        st.warning("Please define at least one value before using the AI planner.")
        st.stop()

    # --- Input Form ---
    with st.form("planner_form"):
        user_input = st.text_area(
            "What's on your mind for today?",
            height=150,
            placeholder=(
                "e.g., I need to finish the client report, want to run at lunch, "
                "and should call Sarah this evening."
            )
        )
        # NEW: Capture state for prediction
        c1, c2 = st.columns(2)
        current_energy = c1.slider("Current Energy", 1, 10, 6)
        current_mood = c2.slider("Current Mood", 1, 10, 5)
        submit_button = st.form_submit_button("Generate Plan")

    # --- AI Processing ---
    if submit_button and user_input:
        with st.spinner("AI is thinking..."):
            proposed_plan = api_client.generate_plan_from_text(user_input, current_values)
        
        if proposed_plan and "tasks" in proposed_plan:
            st.success("Here’s the AI-generated plan:")
            st.session_state.proposed_tasks = proposed_plan["tasks"]

            for i, task in enumerate(st.session_state.proposed_tasks):
                # --- GET PREDICTION ---
                pred_score = api_client.get_predicted_fulfillment(
                    task_type=task.get('task_type'),
                    aligned_value=task.get('aligned_value'),
                    energy_level=current_energy,
                    mood_before=current_mood
                )
                st.markdown(f"**Task {i+1}: {task.get('task_name', 'N/A')}**")
                st.markdown(f"> *Value:* **{task.get('aligned_value', 'N/A')}**")
                st.markdown(f"> *Type:* {task.get('task_type', 'N/A')}")
                st.markdown(f"> *Preferred Time:* {task.get('time_preference', 'N/A')}")
                st.divider()
                
                # DISPLAY PREDICTION
                if pred_score:
                    if pred_score > 7:
                        st.caption(f"🚀 **High Potential:** Predicted Fulfillment {pred_score}/10")
                    elif pred_score < 5:
                        st.caption(f"⚠️ **Warning:** Predicted Fulfillment only {pred_score}/10. Maybe adjust?")
                    else:
                        st.caption(f"ℹ️ Predicted Fulfillment: {pred_score}/10")
                else:
                    st.caption("ℹ️ Not enough data to predict fulfillment yet.")
                
                st.divider()
        else:
            st.error("The AI couldn’t generate a plan. Try rephrasing your input.")

    # --- Save To Log ---
    if "proposed_tasks" in st.session_state:
        if st.button("Looks good! Add to my log"):
            with st.spinner("Saving tasks..."):
                for task in st.session_state.proposed_tasks:
                    # WE USE API_CLIENT HERE NOW
                    api_client.log_task({
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "task": task.get("task_name"),
                        "task_type": task.get("task_type"),
                        "aligned_value": task.get("aligned_value"),
                        "dread_level": 3,
                        "location": "any",
                        "planned_time": task.get("time_preference", "00:00"),
                        "actual_time": "00:00",
                        "did_it": 0,
                        "mood_before": 5,
                        "sleep_quality": 7,
                        "energy_level": 6,
                    })

            st.success("Your plan has been saved! Check the Log & Review page.")
            del st.session_state.proposed_tasks
            st.rerun()


# =====================================================================================
# PAGE 2 — LOG & REVIEW
# =====================================================================================
elif page == "Log & Review":
    st.title("📋 Log & Review Your Day")

    # Fetch values via API for the dropdown
    current_values = api_client.get_values()
    if not current_values:
        st.warning("Please go to 'Define Your Values' and add at least one value.")
        st.stop()

    # --- Manual Logging Form ---
    st.header("Manually Log an Intention")
    with st.form("task_form", clear_on_submit=True):
        task_name = st.text_input("Task Name", placeholder="e.g., Go for a run")
        aligned_value = st.selectbox("Which value does this task align with?", current_values)

        col1, col2 = st.columns(2)
        with col1:
            task_type = st.selectbox(
                "Task Type",
                ["💪 Exercise", "🧠 Deep Work", "🧹 Chore", "🎨 Creative",
                 "📖 Learning", "Shallow Work"]
            )
        with col2:
            location = st.selectbox(
                "Location",
                ["🏡 Home", "🏢 Office", "🏋️ Gym", "☕️ Cafe", "🌳 Outside"]
            )

        dread_level = st.slider("Dread Level (1=Excited, 10=Dread)", 1, 10, 3)
        st.divider()

        st.subheader("Initial State")
        col1, col2, col3 = st.columns(3)
        with col1:
            mood = st.slider("Mood Before", 1, 10, 5)
        with col2:
            sleep = st.slider("Sleep Quality", 1, 10, 7)
        with col3:
            energy = st.slider("Energy Level", 1, 10, 6)

        submit_task = st.form_submit_button("Log Task")

    # --- Save Task via API ---
    if submit_task and task_name:
        new_task = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "task": task_name,
            "task_type": task_type.split(" ")[1],
            "aligned_value": aligned_value,
            "dread_level": dread_level,
            "location": location.split(" ")[1],
            "planned_time": "00:00",
            "actual_time": "00:00",
            "did_it": 0,
            "mood_before": mood,
            "sleep_quality": sleep,
            "energy_level": energy,
        }
        # USE API CLIENT
        api_client.log_task(new_task)
        st.success(f"Logged: '{task_name}' via API!")

    # --- Review Log via API ---
    st.divider()
    st.header("Review Your Log")

    # USE API CLIENT
    all_tasks_df = api_client.get_all_tasks()

    if all_tasks_df.empty:
        st.info("Your log is empty. Add a task above to begin.")
    else:
        for index, row in all_tasks_df.iterrows():
            if row["did_it"] == 0:
                with st.expander(f"PENDING: {row['task']} ({row['aligned_value']})"):
                    st.write(f"Logged on: {row['date']}")
                    
                    with st.form(f"feedback_form_{row['id']}"):
                        st.subheader("Post-Task Check-in")
                        mood_after = st.slider("Mood After", 1, 10, 5, key=f"mood_{row['id']}")
                        fulfillment = st.slider("Energy Impact (1=Drained, 10=Energized)", 1, 10, 5, key=f"fulfill_{row['id']}")
                        
                        saved = st.form_submit_button("Mark as Done")
                        if saved:
                            # USE API CLIENT
                            api_client.update_task_with_feedback(
                                task_id=row["id"],
                                mood_after=mood_after,
                                fulfillment_score=fulfillment
                            )
                            st.success("Task updated. Nice work!")
                            st.rerun()
            else:
                st.success(f"DONE: {row['task']} (Fulfillment: {row.get('fulfillment_score', 'N/A')}/10)")

# =====================================================================================
# PAGE 3 — DASHBOARD
# =====================================================================================
elif page == "Dashboard":
    st.title("📊 Alignment Dashboard")
    st.markdown("See how your actions align with your values.")

    # 1. Fetch Data via API
    data = api_client.get_alignment_analytics()

    if not data or data['total_tasks'] == 0:
        st.info("Not enough data yet. Log some tasks to see your insights!")
    else:
        # Convert breakdown to DataFrame for charting
        df = pd.DataFrame(data['breakdown'])

        col1, col2 = st.columns(2)
        with col1:
            st.metric("Total Tasks Logged", data['total_tasks'])
        with col2:
            if not df.empty:
                best_value = df.loc[df['avg_fulfillment'].idxmax()]
                st.metric("Most Fulfilling Value", f"{best_value['value_name']} ({best_value['avg_fulfillment']:.1f}/10)")

        st.divider()
        st.subheader("Task Volume by Value")
        st.bar_chart(df, x="value_name", y="task_count", color="value_name")

        st.divider()
        st.subheader("Fulfillment Score by Value")
        st.bar_chart(df, x="value_name", y="avg_fulfillment")

# =====================================================================================
# PAGE 4 — DEFINE YOUR VALUES
# =====================================================================================
elif page == "Define Your Values":
    st.title("🧭 Define Your Core Values")
    st.markdown("Your values are the compass for your life. Define 3-5 core values.")

    with st.form(key="value_form", clear_on_submit=True):
        new_value = st.text_input("Enter a new core value:")
        submit_button = st.form_submit_button(label="Add Value")

        if submit_button and new_value:
            api_client.add_value(new_value)

    st.divider()
    st.subheader("Your Current Values")
    
    current_values = api_client.get_values()

    if not current_values:
        st.info("You haven't added any values yet.")
    else:
        for i in range(0, len(current_values), 4):
            cols = st.columns(4)
            for j in range(4):
                if i + j < len(current_values):
                    value = current_values[i+j]
                    with cols[j]:
                        st.button(f"❌ {value}", key=f"del_{value}", on_click=api_client.delete_value, args=(value,))