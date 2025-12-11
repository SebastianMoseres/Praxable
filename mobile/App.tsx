import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { theme } from './theme';
import { notificationService } from './services/notifications';

// Screens
import PlannerScreen from './screens/PlannerScreen';
import CalendarScreen from './screens/CalendarScreen';
import ValuesScreen from './screens/ValuesScreen';
import PredictorScreen from './screens/PredictorScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // Request notification permissions on app load (will gracefully fail in Expo Go)
    notificationService.requestPermissions().catch(err => {
      console.warn('Notifications not available:', err);
    });
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.backgroundSecondary,
          text: theme.colors.text,
          border: 'rgba(255, 255, 255, 0.1)',
          notification: theme.colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Plan"
          component={PlannerScreen}
          options={{
            tabBarLabel: 'Plan',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>✨</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarLabel: 'Today',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📅</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📊</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Values"
          component={ValuesScreen}
          options={{
            tabBarLabel: 'Values',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>💎</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Predict"
          component={PredictorScreen}
          options={{
            tabBarLabel: 'Predict',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🔮</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Discover"
          component={RecommendationsScreen}
          options={{
            tabBarLabel: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🎯</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
