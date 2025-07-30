import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_HEIGHT = 50;
const hours = [...Array(24).keys()].map((i) => i.toString().padStart(2, '0'));
const minutes = [...Array(60).keys()].map((i) => i.toString().padStart(2, '0'));
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AlarmListScreen({ navigation, route }) {
  const { alarm: editingAlarm } = route.params || {};

  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [selectedDays, setSelectedDays] = useState(['Mon']);
  const [sound, setSound] = useState('Neon Glow');

  const hourRef = useRef();
  const minuteRef = useRef();

  useEffect(() => {
    if (editingAlarm) {
      // If editing, load existing values
      setHour(editingAlarm.hour);
      setMinute(editingAlarm.minute);
      setSelectedDays(editingAlarm.repeat || []);
      setSound(editingAlarm.sound || 'Neon Glow');
  
      setTimeout(() => {
        const hourIndex = hours.indexOf(editingAlarm.hour);
        const minuteIndex = minutes.indexOf(editingAlarm.minute);
        hourRef.current?.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: true });
        minuteRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: true });
      }, 100);
    } else {
      // If adding new alarm, use current time
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
  
      setHour(currentHour);
      setMinute(currentMinute);
      setSelectedDays(['Mon']);
      setSound('Neon Glow');
  
      setTimeout(() => {
        const hourIndex = hours.indexOf(currentHour);
        const minuteIndex = minutes.indexOf(currentMinute);
        hourRef.current?.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: true });
        minuteRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: true });
      }, 100);
    }
  }, []);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const saveAlarm = async () => {
    const newAlarm = {
      id: editingAlarm?.id || Date.now().toString(),
      hour,
      minute,
      repeat: selectedDays,
      sound,
      isActive: true,
    };

    try {
      const existing = await AsyncStorage.getItem('alarms');
      const alarms = existing ? JSON.parse(existing) : [];

      const updatedAlarms = editingAlarm
        ? alarms.map((a) => (a.id === editingAlarm.id ? newAlarm : a))
        : [...alarms, newAlarm];

      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));

      Toast.show({
        type: 'success',
        text1: editingAlarm ? 'Alarm Updated!' : 'Alarm Saved!',
        text2: editingAlarm
          ? 'Your alarm has been updated successfully.'
          : 'Your alarm has been added successfully.',
        position: 'bottom',
      });

    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '❌ Save Failed!',
        text2: 'Please try again later.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.timePickerContainer}>
          <ScrollView
            ref={hourRef}
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              setHour(hours[index]);
            }}
          >
            {hours.map((h, i) => (
              <View key={i} style={styles.pickerItem}>
                <Text style={hour === h ? styles.pickerTextSelected : styles.pickerText}>{h}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.colon}>:</Text>

          <ScrollView
            ref={minuteRef}
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={styles.pickerContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
              setMinute(minutes[index]);
            }}
          >
            {minutes.map((m, i) => (
              <View key={i} style={styles.pickerItem}>
                <Text style={minute === m ? styles.pickerTextSelected : styles.pickerText}>{m}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.repeatRow}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
            >
              <Text style={selectedDays.includes(day) ? styles.dayTextSelected : styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sound</Text>
        <View style={styles.soundRow}>
          <Text style={styles.soundLabel}>Alarm Sound</Text>
          <Text style={styles.soundValue}>{sound}</Text>
        </View>

        <TouchableOpacity style={styles.soundLibraryRowHighlighted} onPress={() => navigation.navigate('Sound')}>
          <Text style={styles.soundLibraryText}>Sound Library</Text>
          <Text style={styles.soundLibraryArrow}>{'\u25B6'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveAlarm}>
        <Text style={styles.saveText}>{editingAlarm ? 'Update Alarm' : 'Save Alarm'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    height: ITEM_HEIGHT * 5,
    marginTop: 10,
  },
  picker: {
    width: 80,
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 22,
    color: '#666',
  },
  pickerTextSelected: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  colon: {
    fontSize: 28,
    color: '#000',
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
    fontWeight: '600',
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  dayButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 5,
  },
  dayButtonSelected: {
    backgroundColor: '#989898',
  },
  dayText: {
    color: '#fff',
    fontSize: 14,
  },
  dayTextSelected: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  soundLabel: {
    color: '#000',
    fontSize: 16,
  },
  soundValue: {
    color: '#000',
    fontSize: 16,
  },
  soundLibraryRowHighlighted: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  soundLibraryText: {
    color: '#000',
    fontSize: 16,
    flexGrow: 1,
  },
  soundLibraryArrow: {
    color: '#000',
    fontSize: 20,
    flexShrink: 0,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    marginTop: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
