import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlannerScreen } from './screens/PlannerScreen';
import { ValuesScreen } from './screens/ValuesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { PredictorScreen } from './screens/PredictorScreen';
import { RecommendationsScreen } from './screens/RecommendationsScreen';
import { SetupScreen } from './screens/SetupScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { api } from './services/api';
import './styles/index.css';

function App() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const status = await api.getConfigStatus();
      setIsConfigured(status.is_configured);
    } catch (error) {
      console.error("Failed to check configuration:", error);
      // Assume configured or fail gracefully? 
      // Safest to assume NOT configured if check fails (could be backend down)
      setIsConfigured(false);
    }
  };

  if (isConfigured === null) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#0A0E1A',
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    );
  }

  if (!isConfigured) {
    return <SetupScreen onConfigured={() => setIsConfigured(true)} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/planner" element={<PlannerScreen />} />
          <Route path="/values" element={<ValuesScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/predictor" element={<PredictorScreen />} />
          <Route path="/discover" element={<RecommendationsScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
