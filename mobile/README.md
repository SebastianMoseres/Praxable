# Praxable Mobile - Quick Start Guide

## 🚀 Running the App

### Prerequisites
- Node.js installed
- Expo Go app on your phone (iOS/Android)
- Backend server running

### Step 1: Start the Backend
```bash
cd backend
uvicorn app.main:app --reload
```
Backend will run on http://localhost:8000

### Step 2: Start the Mobile App
```bash
cd mobile
npm start
```

### Step 3: Open on Your Phone
1. Install **Expo Go** from App Store or Play Store
2. Scan the QR code shown in terminal
3. App will load on your phone!

## 📱 Features Implemented

✅ **Planner Screen** (Current)
- Text input for daily plans
- Voice recording with microphone
- Energy & mood sliders
- AI plan generation
- Task approval → Calendar integration

⏳ **Coming Next**
- Calendar view screen
- Values management
- Dashboard with analytics
- Navigation between screens

## 🔧 Development Tips

### Testing Voice Input
The microphone will only work on a physical device, not in the simulator.

### Connecting to Backend
The app connects to `http://localhost:8000` by default. When testing on a real device:
1. Find your computer's local IP (e.g., `192.168.1.100`)
2. Update `API_BASE` in `services/api.ts`:
   ```typescript
   const API_BASE = 'http://192.168.1.100:8000';
   ```

### Hot Reload
Any changes you make will automatically reload on your phone!

## 📁 Project Structure

```
mobile/
├── App.tsx                  # Main entry point
├── screens/
│   └── PlannerScreen.tsx    # AI planner with voice input
├── services/
│   └── api.ts               # Backend API client
└── package.json
```

## 🐛 Troubleshooting

**"Cannot connect to backend"**
- Make sure backend is running: `uvicorn app.main:app --reload`
- Check firewall isn't blocking port 8000
- Update API_BASE to your computer's IP if on real device

**"Microphone not working"**
- Grant microphone permissions when prompted
- Restart the app if needed

**"Dependencies error"**
```bash
cd mobile
rm -rf node_modules
npm install
```

## 📲 Next Steps

1. Test the Planner screen
2. Try voice input
3. Generate a plan
4. Check if tasks appear in your calendar

Ready to build more screens? Let me know! 🎉
