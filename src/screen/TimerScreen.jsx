import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { playTimerSound, stopTimerSound } from '../Sound/timerSound';
import { registerForPushNotificationsAsync, showTimeCompletedNotification } from '../Notification/localNotification';


const TimerScreen = () => {
  const [input, setInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(null);
  const intervalRef = useRef(null);
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  
  const handleInput = (value) => {
    if (value === '⌫') {
      setInput(input.slice(0, -1));
    } else if (input.length < 6) {
      setInput(input + value);
    }
  };
  const startTimer = (total) => {
    setSecondsLeft(total);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
  
          playTimerSound();             // 🔊 Ring
          showTimeCompletedNotification(); // 🔔 Notification
  
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  

  const handleStart = () => {
    if (input.length === 0) {
      alert('Please enter a time');
      return;
    }

    const padded = input.padStart(6, '0');
    const h = parseInt(padded.slice(0, 2));
    const m = parseInt(padded.slice(2, 4));
    const s = parseInt(padded.slice(4, 6));
    const total = h * 3600 + m * 60 + s;

    if (total === 0) {
      alert('Enter a valid time');
      return;
    }

    startTimer(total);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    stopTimerSound();
  };

  const resetTimer = () => {
    stopTimer();
    setSecondsLeft(null);
    setInput('');
  };

  const displaySeconds = secondsLeft !== null
  ? String(Math.floor(secondsLeft % 60)).padStart(2, '0')
  : input.padStart(6, '0').slice(4, 6);
  const displayMinutes = secondsLeft !== null
  ? String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  : input.padStart(6, '0').slice(2, 4);

const displayHours = secondsLeft !== null
  ? String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  : input.padStart(6, '0').slice(0, 2);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'];

  return (
    <View style={styles.container}>
      <Text style={styles.timerTitle}>Timer</Text>

      <View style={styles.timeDisplay}>
        <Text style={styles.timeNumber}>{String(displayHours).padStart(2, '0')}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.timeNumber}>{String(displayMinutes).padStart(2, '0')}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.timeNumber}>{String(displaySeconds).padStart(2, '0')}</Text>
      </View>

      <View style={styles.unitLabels}>
        <Text style={styles.unit}>H</Text>
        <Text style={styles.unit}>M</Text>
        <Text style={styles.unit}>S</Text>
      </View>

      {secondsLeft === null && (
        <View style={styles.keypad}>
          {digits.map((digit, index) => (
            <TouchableOpacity
              key={index}
              style={styles.key}
              onPress={() => handleInput(digit)}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.controls}>
        {secondsLeft === null ? (
          <TouchableOpacity style={styles.controlBtn} onPress={handleStart}>
            <Text style={styles.controlText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.controlBtn} onPress={stopTimer}>
              <Text style={styles.controlText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
              <Text style={styles.controlText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 85,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
  },
  timerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 32,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 8,
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  colon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  unitLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
    marginTop: 6,
    marginBottom: 32,
  },
  unit: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  key: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    elevation: 4,
    margin: 6,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 20,
  },
  controlBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 4,
  },
  controlText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
