import React, { useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './src/navigation/TabNavigator';
import { toastConfig } from './src/toastConfig';
import RingingScreen from './src/screen/RingingScreen';

import { navigationRef } from './src/navigation/navigationRef';
import { registerForPushNotificationsAsync } from './src/Notification/localNotification';
import { scheduleAlarm } from './src/services/timerService'; // adjust path if needed

const Stack = createStackNavigator();
const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export default function App() {
  const initialScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(initialScheme);

  // Listen to color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Notifications: permission, tap handling, and repeating reschedule
  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const alarmId = response.notification.request.content.data.alarmId;
        if (!alarmId) return;

        // Navigate to ringing screen if ready
        if (navigationRef.isReady()) {
          navigationRef.navigate('RingingScreen', { alarmId });
        }

        // Load alarms from storage
        const raw = await AsyncStorage.getItem('alarms');
        if (!raw) return;
        const alarms = JSON.parse(raw);
        const alarm = alarms.find((a) => a.id === alarmId);
        if (!alarm || !alarm.isActive) return;

        // Calculate next alarm time (same logic as in AlarmListScreen)
        const now = new Date();
        const selectedDays = alarm.repeat || [];
        const alarmHour = alarm.hour;
        const alarmMinute = alarm.minute;

        const calculateNextAlarm = () => {
          if (selectedDays.length === 0) {
            const alarmTime = new Date(now);
            alarmTime.setHours(alarmHour, alarmMinute, 0, 0);
            if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1);
            return alarmTime;
          }

          const currentDay = now.getDay();
          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          const alarmTimeMinutes = alarmHour * 60 + alarmMinute;

          let daysToAdd = 0;
          let found = false;

          for (let i = 0; i < 7; i++) {
            const checkDay = (currentDay + i) % 7;
            const dayName = Object.keys(dayMap).find((k) => dayMap[k] === checkDay);
            if (selectedDays.includes(dayName)) {
              if (i === 0 && alarmTimeMinutes > currentTimeMinutes) {
                daysToAdd = 0;
                found = true;
                break;
              }
              if (i > 0) {
                daysToAdd = i;
                found = true;
                break;
              }
            }
          }

          if (!found) daysToAdd = 7;
          const next = new Date(now);
          next.setDate(next.getDate() + daysToAdd);
          next.setHours(alarmHour, alarmMinute, 0, 0);
          return next;
        };

        const nextAlarmTime = calculateNextAlarm();

        // Schedule next occurrence for repeating alarms
        await scheduleAlarm(alarmId, nextAlarmTime);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootSiblingParent>
        <NavigationContainer
          theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          ref={navigationRef}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="RingingScreen" component={RingingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
