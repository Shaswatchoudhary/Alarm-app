import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { playAlarmSound, stopAlarmSound } from '../Sound/ringingSound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import BottomToast from '../component/Bottom';

const RingingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alarm } = route.params || {};
  const [alarmTime, setAlarmTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setAlarmTime(time);

    // Add error handling for sound
    const startAlarm = async () => {
      try {
        await playAlarmSound();
        Vibration.vibrate([0, 300, 1200], true);
      } catch (error) {
        console.error('Error starting alarm:', error);
        // Still vibrate even if sound fails
        Vibration.vibrate([0, 300, 1200], true);
      }
    };

    startAlarm();

    if (alarm && (!alarm.repeat || alarm.repeat.length === 0)) {
      disableAlarm(alarm.id);
    }

    return () => {
      try {
        stopAlarmSound();
      } catch (error) {
        console.error('Error stopping alarm sound:', error);
      }
      Vibration.cancel();
    };
  }, []);

  const disableAlarm = async (alarmId) => {
    try {
      const alarms = JSON.parse(await AsyncStorage.getItem('alarms')) || [];
      const updatedAlarms = alarms.map((a) =>
        a.id === alarmId ? { ...a, isActive: false } : a
      );
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error disabling alarm:', error);
    }
  };

  const onDismiss = async () => {
    try {
      // Stop sound with error handling
      try {
        stopAlarmSound();
      } catch (soundError) {
        console.error('Error stopping sound:', soundError);
      }
      
      Vibration.cancel();

      if (alarm && alarm.id) {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (let notification of scheduled) {
          if (notification.content.data?.alarmId === alarm.id) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }

        await disableAlarm(alarm.id);
      }
      
      navigation.navigate('Tabs');
    } catch (error) {
      console.error('Dismiss error:', error);
      // Still navigate even if there's an error
      navigation.navigate('Tabs');
    }
  };

  const onSnooze = async () => {
    try {
      // Stop sound with error handling
      try {
        stopAlarmSound();
      } catch (soundError) {
        console.error('Error stopping sound:', soundError);
      }
      
      Vibration.cancel();

      if (alarm && alarm.id) {
        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000); // ⏰ +10 mins
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Snoozed Alarm',
            body: 'Your alarm is ringing again.',
            sound: 'default',
            data: { alarmId: alarm.id },
          },
          trigger: snoozeTime,
        });
      }

      navigation.navigate('Tabs');
    } catch (error) {
      console.error('Snooze error:', error);
      // Still navigate even if there's an error
      navigation.navigate('Tabs');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Alarm animation */}
      <View style={styles.alarmContainer}>
        <View style={[styles.soundWave, styles.wave1]} />
        <View style={[styles.soundWave, styles.wave2]} />
        <View style={[styles.soundWave, styles.wave3]} />
        
        <View style={styles.alarmBell}>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>
      </View>
      
      <Text style={styles.label}>Alarm Ringing</Text>
      <Text style={styles.time}>{alarmTime}</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
          <Text style={styles.snoozeText}>Snooze +10 min</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RingingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  
  // Alarm animation
  alarmContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 100,
    width: 100,
    position: 'relative',
  },
  
  soundWave: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: '#000',
    borderStyle: 'dashed',
  },
  
  wave1: {
    width: 60,
    height: 60,
    opacity: 0.8,
  },
  
  wave2: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  
  wave3: {
    width: 100,
    height: 100,
    opacity: 0.3,
  },
  
  alarmBell: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  
  bellIcon: {
    fontSize: 24,
  },
  
  label: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  
  time: {
    fontSize: 48,
    fontWeight: '600',
    color: '#000',
    marginBottom: 40,
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  dismissButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  
  snoozeButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
  },
  
  // Fixed text colors
  dismissText: {
    color: '#fff', // White text for black button
    fontSize: 16,
    fontWeight: '600',
  },
  
  snoozeText: {
    color: '#000', // Black text for white button
    fontSize: 16,
    fontWeight: '600',
  },
});