import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from . import data_manager

class FulfillmentPredictor:
    def __init__(self):
        self.model = None
        self.is_trained = False

    def train(self):
        """
        Fetches data from the database and trains the model 
        to predict 'fulfillment_score'.
        """
        df = data_manager.get_all_tasks()
        
        # 1. Filter for completed tasks with a fulfillment score
        # We assume empty strings or None are invalid
        train_df = df.dropna(subset=['fulfillment_score'])
        
        # We need enough data to train
        if len(train_df) < 5:
            print("Not enough data to train model.")
            self.is_trained = False
            return

        # 2. Define Features (X) and Target (y)
        # We want to predict 'fulfillment_score' based on these inputs:
        features = ['task_type', 'aligned_value', 'energy_level', 'mood_before']
        target = 'fulfillment_score'

        X = train_df[features]
        y = train_df[target]

        # 3. Preprocessing
        # 'task_type' and 'aligned_value' are text, so we must convert them to numbers
        categorical_features = ['task_type', 'aligned_value']
        numerical_features = ['energy_level', 'mood_before']

        preprocessor = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
                ('num', 'passthrough', numerical_features)
            ]
        )

        # 4. Build Pipeline
        self.model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100))
        ])

        # 5. Train
        self.model.fit(X, y)
        self.is_trained = True
        print("Model trained successfully.")

    def predict(self, task_type, aligned_value, energy_level, mood_before):
        """
        Predicts fulfillment score for a hypothetical task.
        """
        if not self.is_trained:
            return None

        # Create a DataFrame for the single input
        input_data = pd.DataFrame({
            'task_type': [task_type],
            'aligned_value': [aligned_value],
            'energy_level': [energy_level],
            'mood_before': [mood_before]
        })

        try:
            prediction = self.model.predict(input_data)
            return round(prediction[0], 1) # Return score rounded to 1 decimal
        except Exception as e:
            print(f"Prediction error: {e}")
            return None

# Create a global instance to be used by the API
predictor = FulfillmentPredictor()