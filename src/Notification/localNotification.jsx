// ./src/Notification/localNotification.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ----- Global handler so notifications show in foreground -----
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ----- Permission & channel setup -----
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push notification permissions!');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// ----- Immediate notification (timer completion) -----
export async function showTimeCompletedNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Timer Completed!',
        body: 'Your countdown has finished.',
        sound: 'default',
      },
      trigger: null, // immediate
    });
  } catch (error) {
    console.error('Notification error (timer):', error);
  }
}

// ----- Schedule an alarm notification -----
export async function scheduleAlarmNotification(dateTime, alarmId) {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Alarm Ringing',
        body: 'Tap to stop or snooze',
        sound: 'default',
        data: { alarmId },
      },
      trigger: dateTime instanceof Date ? dateTime : new Date(dateTime),
    });
    return notificationId;
  } catch (error) {
    console.error('Error scheduling alarm notification:', error);
    return null;
  }
}

// ----- Cancel a scheduled notification by its ID -----
export async function cancelScheduledNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('Failed to cancel scheduled notification:', e);
  }
}
