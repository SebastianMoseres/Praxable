import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

class Predictor:
    def __init__(self):
        self.model = None
        self.is_trained = False

    def train(self, df):
        """Trains a logistic regression model on the provided dataframe."""
        # We only train on tasks that have an outcome (were done or skipped)
        # For now, this is all our data, but in the future it would filter out planned tasks
        train_df = df.copy()

        # Define which columns are categorical and which are numerical
        categorical_features = ['task_type', 'location']
        numerical_features = ['dread_level', 'mood_before', 'sleep_quality', 'energy_level']
        
        # Define the target variable
        y = train_df['did_it']
        X = train_df[categorical_features + numerical_features]

        # Create a preprocessor to handle categorical features
        # OneHotEncoder converts categories like 'Home' or 'Gym' into numerical format
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', 'passthrough', numerical_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])

        # Create the full model pipeline
        self.model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', LogisticRegression(solver='liblinear'))
        ])
        
        # Train the model
        self.model.fit(X, y)
        self.is_trained = True
        print("Model has been trained successfully.")

    def predict_probability(self, task_details_df):
        """Predicts the follow-through probability for a new task."""
        if not self.is_trained or self.model is None:
            # Return a neutral probability if the model isn't trained
            return 0.5 
        
        # predict_proba returns probabilities for [class_0, class_1]
        # We want the probability of class 1 (did_it = 1)
        probability = self.model.predict_proba(task_details_df)[:, 1]
        
        # Return the first (and only) item in the array
        return probability[0]