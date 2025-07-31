// src/services/timerService.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_END_KEY = 'currentTimerEnd';
const ALARM_KEY_PREFIX = 'alarm_';

// ---- Timer ----
export async function startTimer(seconds) {
  const end = Date.now() + seconds * 1000;
  await AsyncStorage.setItem(TIMER_END_KEY, end.toString());

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Timer Completed!',
      body: `Your ${seconds}s timer finished.`,
      sound: 'default',
    },
    trigger: new Date(end),
  });
}

export async function getRemainingTimerSeconds() {
  const endStr = await AsyncStorage.getItem(TIMER_END_KEY);
  if (!endStr) return 0;
  const remainingMs = Number(endStr) - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export async function clearTimer() {
  await AsyncStorage.removeItem(TIMER_END_KEY);
}

// ---- Alarm ----
export async function scheduleAlarm(alarmId, date) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Alarm Ringing',
      body: 'Tap to stop or snooze',
      sound: 'default',
      data: { alarmId },
    },
    trigger: date,
  });

  await AsyncStorage.setItem(
    `${ALARM_KEY_PREFIX}${alarmId}`,
    date.getTime().toString()
  );

  return notificationId;
}

export async function getNextAlarmTime(alarmId) {
  const ts = await AsyncStorage.getItem(`${ALARM_KEY_PREFIX}${alarmId}`);
  if (!ts) return null;
  return new Date(Number(ts));
}

export async function clearScheduledAlarm(alarmId) {
  await AsyncStorage.removeItem(`${ALARM_KEY_PREFIX}${alarmId}`);
}

export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('Failed to cancel notification:', e);
  }
}
