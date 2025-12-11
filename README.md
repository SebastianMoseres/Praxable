# Praxable - AI Alignment Coach

Praxable is an intelligent personal alignment coach that helps you live according to your core values. By analyzing your daily tasks, energy levels, and fulfillment, it provides personalized activity recommendations and daily planning assistance.

## 🚀 Features

-   **Smart Planner**: AI-assisted daily planning that helps you align tasks with your core values.
-   **Adaptive Recommendations**: "Discover" page suggestions that evolve based on your feedback and history (using Scikit-Learn).
-   **Activity History**: Track past activities and rate your fulfillment to teach the AI what works for you.
-   **Core Values Tracking**: Define and monitor your progress towards your fundamental life principles.
-   **Calendar Integration**: Seamlessly syncs with Google Calendar.
-   **Analytics**: Visual insights into your productivity and value alignment.

## 🛠️ Tech Stack

### Frontend
-   **React** (Vite)
-   **TypeScript**
-   **Glassmorphism UI** (Custom CSS)

### Backend
-   **Python** (FastAPI)
-   **SQLite** (Database)
-   **Scikit-Learn** (Machine Learning)
-   **Google Gemini** (Generative AI)

## 📦 Installation & Setup

### Prerequisites
-   Node.js & npm
-   Python 3.8+
-   Google Gemini API Key
-   Google Calendar Credentials (`credentials.json`)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set up environment variables:
    Create a `.env` file in `backend/` and add:
    ```env
    GEMINI_API_KEY=your_key_here
    ```
5.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will run at `http://127.0.0.1:8000`.

### Frontend Setup

1.  Navigate to the web directory:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## 🤖 Machine Learning

The application uses an adaptive Random Forest Regressor to predict activity fulfillment.
-   **Training**: Automatically retrains when you update task feedback in the History tab.
-   **Features**: Uses activity type, aligned values, energy level, and pre-activity mood to predict outcomes.

## 📄 License

[MIT](LICENSE)
