#!/bin/bash
# This script will restore all the calendar and voice input features

echo "Installing dependencies..."
pip install streamlit-calendar python-multipart --quiet

echo "✅ Dependencies installed"
echo "⚠️  Server restarts may be required for changes to take effect"
echo "Backend: uvicorn backend.app.main:app --reload"
echo "Frontend: streamlit run frontend_app.py"
