"""
Activity Recommendations Module

This module contains the activity database and recommendation logic
to suggest activities based on user values and available free time.
"""

from typing import List, Dict, Any
from . import scheduler

# Activity Database
# Each activity has: name, duration, aligned values, description, and category
ACTIVITIES = [
    {
        "id": 1,
        "name": "Morning Jog",
        "duration_minutes": 30,
        "aligned_values": ["Health", "Energy", "Discipline"],
        "description": "Start your day with a refreshing run to boost energy and mental clarity",
        "category": "Physical",
        "emoji": "🏃"
    },
    {
        "id": 2,
        "name": "Read a Book",
        "duration_minutes": 45,
        "aligned_values": ["Growth", "Learning", "Knowledge", "Wisdom"],
        "description": "Dive into a book that expands your perspective and knowledge",
        "category": "Mental",
        "emoji": "📚"
    },
    {
        "id": 3,
        "name": "Meditation Session",
        "duration_minutes": 20,
        "aligned_values": ["Peace", "Mindfulness", "Health", "Balance"],
        "description": "Clear your mind and center yourself with focused meditation",
        "category": "Mental",
        "emoji": "🧘"
    },
    {
        "id": 4,
        "name": "Call a Friend",
        "duration_minutes": 30,
        "aligned_values": ["Connection", "Relationships", "Love", "Community"],
        "description": "Strengthen your bonds by reaching out to someone you care about",
        "category": "Social",
        "emoji": "📞"
    },
    {
        "id": 5,
        "name": "Creative Writing",
        "duration_minutes": 45,
        "aligned_values": ["Creativity", "Expression", "Growth", "Art"],
        "description": "Express yourself through writing - journal, stories, or poetry",
        "category": "Creative",
        "emoji": "✍️"
    },
    {
        "id": 6,
        "name": "Yoga Practice",
        "duration_minutes": 60,
        "aligned_values": ["Health", "Balance", "Mindfulness", "Strength"],
        "description": "Build strength and flexibility while connecting mind and body",
        "category": "Physical",
        "emoji": "🧘‍♀️"
    },
    {
        "id": 7,
        "name": "Learn Something New",
        "duration_minutes": 30,
        "aligned_values": ["Growth", "Learning", "Curiosity", "Knowledge"],
        "description": "Watch a tutorial or take an online course on a topic you're curious about",
        "category": "Mental",
        "emoji": "🎓"
    },
    {
        "id": 8,
        "name": "Cook a Healthy Meal",
        "duration_minutes": 45,
        "aligned_values": ["Health", "Creativity", "Self-care", "Nourishment"],
        "description": "Prepare a nutritious meal with fresh ingredients",
        "category": "Physical",
        "emoji": "🍳"
    },
    {
        "id": 9,
        "name": "Walk in Nature",
        "duration_minutes": 40,
        "aligned_values": ["Health", "Peace", "Nature", "Mindfulness"],
        "description": "Connect with nature and clear your mind with a peaceful walk",
        "category": "Physical",
        "emoji": "🌳"
    },
    {
        "id": 10,
        "name": "Practice Gratitude",
        "duration_minutes": 15,
        "aligned_values": ["Mindfulness", "Positivity", "Peace", "Happiness"],
        "description": "Write down things you're grateful for to cultivate positivity",
        "category": "Mental",
        "emoji": "🙏"
    },
    {
        "id": 11,
        "name": "Draw or Paint",
        "duration_minutes": 60,
        "aligned_values": ["Creativity", "Expression", "Art", "Flow"],
        "description": "Express yourself visually through drawing or painting",
        "category": "Creative",
        "emoji": "🎨"
    },
    {
        "id": 12,
        "name": "Coffee with a Colleague",
        "duration_minutes": 30,
        "aligned_values": ["Connection", "Relationships", "Career", "Community"],
        "description": "Build professional relationships over casual conversation",
        "category": "Social",
        "emoji": "☕"
    },
    {
        "id": 13,
        "name": "Quick Workout",
        "duration_minutes": 20,
        "aligned_values": ["Health", "Energy", "Strength", "Discipline"],
        "description": "Get your heart pumping with a quick HIIT or strength session",
        "category": "Physical",
        "emoji": "💪"
    },
    {
        "id": 14,
        "name": "Listen to a Podcast",
        "duration_minutes": 45,
        "aligned_values": ["Learning", "Growth", "Knowledge", "Curiosity"],
        "description": "Learn something new while relaxing or during a commute",
        "category": "Mental",
        "emoji": "🎧"
    },
    {
        "id": 15,
        "name": "Volunteer Work",
        "duration_minutes": 120,
        "aligned_values": ["Service", "Community", "Purpose", "Compassion"],
        "description": "Give back to your community through volunteer service",
        "category": "Social",
        "emoji": "🤝"
    },
    {
        "id": 16,
        "name": "Play Music",
        "duration_minutes": 45,
        "aligned_values": ["Creativity", "Expression", "Art", "Joy"],
        "description": "Practice an instrument or create music that moves you",
        "category": "Creative",
        "emoji": "🎵"
    },
    {
        "id": 17,
        "name": "Power Nap",
        "duration_minutes": 20,
        "aligned_values": ["Health", "Rest", "Energy", "Self-care"],
        "description": "Recharge with a short, restorative nap",
        "category": "Physical",
        "emoji": "😴"
    },
    {
        "id": 18,
        "name": "Organize Your Space",
        "duration_minutes": 30,
        "aligned_values": ["Order", "Clarity", "Productivity", "Peace"],
        "description": "Declutter and organize to create a peaceful environment",
        "category": "Mental",
        "emoji": "🧹"
    },
]


def get_all_activities() -> List[Dict[str, Any]]:
    """Returns all available activities in the database."""
    return ACTIVITIES


def get_recommendations(
    value_names: List[str], 
    min_duration: int = 0,
    predictor = None,
    context: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """
    Generate activity recommendations based on user values and free time slots.
    
    Args:
        value_names: List of core values to align activities with
        min_duration: Minimum duration in minutes (optional filter)
        predictor: Optional instance of FulfillmentPredictor to score activities
        context: Optional dict with 'energy_level' and 'mood_before'
    
    Returns:
        List of recommended activities with matching free slots
    """
    # Get available free time slots
    free_slots = scheduler.get_free_slots()
    
    # If no values specified, return empty (require at least one value)
    if not value_names:
        return []
    
    recommendations = []
    
    # Normalize value names for case-insensitive matching
    normalized_values = [v.lower() for v in value_names]
    
    for activity in ACTIVITIES:
        # Check if activity aligns with any of the user's values
        activity_values = [v.lower() for v in activity["aligned_values"]]
        
        # Also check if the user value matches the activity category
        activity_category = activity["category"].lower()
        
        matching_values = [v for v in activity_values if v in normalized_values]
        
        # If no direct value match, check if user value matches the category
        if not matching_values and activity_category in normalized_values:
            matching_values = [activity_category]
        
        if not matching_values:
            continue  # Skip activities that don't match any values
        
        # Check if activity duration meets minimum requirement
        if activity["duration_minutes"] < min_duration:
            continue
        
        # Find time slots that can accommodate this activity
        matching_slots = [
            slot for slot in free_slots 
            if slot["duration_minutes"] >= activity["duration_minutes"]
        ]
        
        if matching_slots:
            # Base match score based on how many values match
            match_score = len(matching_values) * 10
            
            predicted_fulfillment = None
            
            # --- ADAPTIVE SCORING ---
            # If we have a predictor and context, see how fulfilling this would be
            if predictor and context and predictor.is_trained:
                # We try to predict using the first matching value, or just the activity's first value
                # Using the value that the USER cares about (matching_values[0]) is better
                test_value = matching_values[0] if matching_values else activity["aligned_values"][0]
                
                predicted_fulfillment = predictor.predict(
                    task_type=activity["category"],
                    aligned_value=test_value,
                    energy_level=context.get('energy_level', 5),
                    mood_before=context.get('mood_before', 5)
                )
                
                # Boost score based on prediction (scale 1-10)
                if predicted_fulfillment:
                    match_score += predicted_fulfillment
            
            # Create recommendation with the first available slot
            recommendation = {
                **activity,
                "matching_values": matching_values,
                "match_score": match_score, 
                "predicted_fulfillment": predicted_fulfillment,
                "suggested_slot": matching_slots[0],  # Use the earliest available slot
                "all_available_slots": matching_slots  # Include all slots for flexibility
            }
            recommendations.append(recommendation)
    
    # Sort recommendations by match score (descending)
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return recommendations
