# Import our configuration variables
from src import config

def generate_nudge(probability, task_details):
    """
    Generates a contextual nudge based on the predicted probability and task details.
    
    Args:
        probability (float): The predicted probability from the model.
        task_details (dict): The dictionary containing details of the new task.
        
    Returns:
        str: A formatted nudge message.
    """
    task_name = task_details.get('task', 'this task')
    
    # Check against the strong nudge threshold
    if probability < config.NUDGE_THRESHOLDS["strong"]:
        return (
            f"**Strong Nudge:** The model predicts a low follow-through chance for '{task_name}'. "
            "Try breaking it down. What is the absolute smallest first step you can take? "
            "Or, try the 5-Minute Rule: just start it for five minutes."
        )
    
    # Check against the medium nudge threshold
    elif probability < config.NUDGE_THRESHOLDS["medium"]:
        return (
            f"**Gentle Reminder:** You're on the fence for '{task_name}'. "
            "To boost your chances, consider 'temptation bundling.' "
            "Can you pair this task with something you enjoy, like listening to a podcast?"
        )
        
    # If probability is high, provide reinforcement
    else:
        return (
            f"**Confidence Boost:** You're in a great position to tackle '{task_name}'. "
            "The conditions look right. Lean into that momentum and get it done!"
        )