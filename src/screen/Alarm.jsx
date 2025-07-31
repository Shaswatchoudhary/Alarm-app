import React, { useEffect, useState , useNavigation , useRoute } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../Notification/localNotification';
import BottomToast from '../component/Bottom';  
import { playRingingSound, stopRingingSound } from '../Sound/ringingSound';
import RingingScreen from '../screen/RingingScreen';

const { width } = Dimensions.get('window');

const Alarm = ({ navigation }) => {
  const [savedAlarms, setSavedAlarms] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const scaleAnim = new Animated.Value(0.9);
  const [selectedAlarms, setSelectedAlarms] = useState([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  useEffect(() => {
    const checkAlarmTrigger = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const today = now.getDay();

      const matchingAlarm = savedAlarms.find(alarm => {
        if (!alarm.isActive) return false;

        const { hour, minute, repeat, createdAt } = alarm;
        const timeMatch = hour === currentHour && minute === currentMinute;

        if (repeat?.length > 0) {
          return timeMatch && repeat.includes(today);
        } else {
          const alarmDate = new Date(createdAt);
          return (
            timeMatch &&
            alarmDate.toDateString() === now.toDateString()
          );
        }
      });

      if (matchingAlarm) {
        navigation.navigate('RingingScreen', { alarm: matchingAlarm });
      }
    };

    const interval = setInterval(checkAlarmTrigger, 60000); // every minute
    return () => clearInterval(interval);
  }, [savedAlarms]);

  
  
  


// Toggle individual alarm selection
const toggleAlarmSelection = (alarmId) => {
  setSelectedAlarms((prevSelected) =>
    prevSelected.includes(alarmId)
      ? prevSelected.filter((id) => id !== alarmId)
      : [...prevSelected, alarmId]
  );
};

// Delete all selected alarms
const deleteSelectedAlarms = async () => {
  const updatedAlarms = savedAlarms.filter(
    (alarm) => !selectedAlarms.includes(alarm.id)
  );

  setSavedAlarms(updatedAlarms);
  setSelectedAlarms([]);
  setMultiSelectMode(false);

  // Save updated alarms to AsyncStorage
  await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
};




  const getNextAlarmMessage = (hour, minute, days) => {
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hour);
    alarmDate.setMinutes(minute);
    alarmDate.setSeconds(0);
  
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    if (days?.length > 0) {
      const today = now.getDay();
      const sortedDays = [...days].sort(
        (a, b) => ((a - today + 7) % 7) - ((b - today + 7) % 7)
      );
  
      let nextDay = sortedDays.find((d) => {
        if (d === today) {
          return alarmDate > now;
        }
        return true;
      });
  
      if (nextDay === undefined && sortedDays.length > 0) {
        nextDay = sortedDays[0]; // Fallback to first selected repeat day
      }
  
      const daysFromNow = (nextDay - today + 7) % 7;
  
      if (daysFromNow === 0) return 'Will ring today';
      if (daysFromNow === 1) return 'Will ring tomorrow';
  
      // Safely check weekday name
      const weekdayName = weekday[nextDay] ?? 'selected day';
      return `Will ring on ${weekdayName}`;
    } else {
      // One-time (non-repeating) alarm
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }
  
      const isToday = now.toDateString() === alarmDate.toDateString();
      const isTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toDateString() === alarmDate.toDateString();
  
      if (isToday) return 'Will ring today';
      if (isTomorrow) return 'Will ring tomorrow';
  
      return `Will ring on ${alarmDate.toLocaleDateString([], { weekday: 'long' })}`;
    }
  };
  
  
  
  const loadAlarms = async () => {
    try {
      const alarms = await AsyncStorage.getItem('alarms');
      if (alarms) {
        setSavedAlarms(JSON.parse(alarms));
      }
    } catch (e) {
      console.error('Error loading alarms:', e);
    }
  };

  useEffect(() => {
    loadAlarms();
    const unsubscribe = navigation.addListener('focus', loadAlarms);
    return unsubscribe;
  }, [navigation]);

  const toggleAlarmActive = async (alarmId) => {
    const updatedAlarms = savedAlarms.map((alarm) =>
      alarm.id === alarmId ? { ...alarm, isActive: !alarm.isActive } : alarm
    );
    setSavedAlarms(updatedAlarms);
    await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
  };

  const handleEdit = (alarm) => {
    navigation.navigate('AlarmListScreen', { alarm });
  };

  const handleDeleteAlarm = async () => {
    const updatedAlarms = savedAlarms.filter((alarm) => alarm.id !== alarmToDelete);
    setSavedAlarms(updatedAlarms);
    await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    setDeleteModalVisible(false);
    setAlarmToDelete(null);
  };

  const showDeleteModal = (alarmId) => {
    setAlarmToDelete(alarmId);
    setDeleteModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {multiSelectMode ? `${selectedAlarms.length} Selected` : 'Alarm'}
        </Text>

        {!multiSelectMode && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AlarmListScreen')}
            style={styles.addAlarmButton}
          >
            <Text style={styles.addAlarmButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Alarm List */}
      <ScrollView style={styles.alarmsListContainer}>
        {savedAlarms.length > 0 ? (
          savedAlarms.map((alarm) => {
            const isSelected = selectedAlarms.includes(alarm.id);
            return (
              <TouchableOpacity
                key={alarm.id}
                style={[
                  styles.savedAlarmItem,
                  multiSelectMode && isSelected && styles.selectedAlarmItem,
                ]}
                onPress={() => {
                  if (multiSelectMode) {
                    toggleAlarmSelection(alarm.id);
                  } else {
                    handleEdit(alarm);
                  }
                }}
                onLongPress={() => {
                  if (!multiSelectMode) {
                    setMultiSelectMode(true);
                    toggleAlarmSelection(alarm.id);
                  }
                }}
                delayLongPress={500}
              >
                <View style={styles.alarmDetails}>
                  <Text style={styles.alarmTime}>
                    {alarm.hour || '00'}:{alarm.minute || '00'}
                  </Text>
                  <Text style={styles.alarmRepeat}>
                    {alarm.repeat?.length > 0 ? alarm.repeat.join(', ') : 'No Repeat'}
                  </Text>
                  <Text style={styles.alarmRepeat}>
                    {getNextAlarmMessage(alarm.hour, alarm.minute, alarm.repeat)}
                  </Text>
                </View>

                {!multiSelectMode && (
                  <TouchableOpacity
                    style={[
                      styles.customSwitchTrack,
                      alarm.isActive && styles.customSwitchTrackActive,
                    ]}
                    onPress={() => toggleAlarmActive(alarm.id)}
                  >
                    <View
                      style={[
                        styles.customSwitchThumb,
                        alarm.isActive && styles.customSwitchThumbActive,
                      ]}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noAlarmsText}>
            No alarms set yet. Tap '+' to create one!
          </Text>
        )}
      </ScrollView>

      {/* Bottom Bar (Multi-Select Mode) */}
      {multiSelectMode && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.cancelMultiSelectButton}
            onPress={() => {
              setMultiSelectMode(false);
              setSelectedAlarms([]);
            }}
          >
            <Text style={styles.bottomBarText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={() => {
              if (selectedAlarms.length === savedAlarms.length) {
                setSelectedAlarms([]);
              } else {
                setSelectedAlarms(savedAlarms.map((alarm) => alarm.id));
              }
            }}
          >
            <Text style={styles.bottomBarText}>
              {selectedAlarms.length === savedAlarms.length ? 'Unselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteMultiSelectButton}
            onPress={deleteSelectedAlarms}
            disabled={selectedAlarms.length === 0}
          >
            <Text
              style={[
                styles.bottomBarText,
                { color: selectedAlarms.length === 0 ? '#aaa' : '#fff' },
              ]}
            >
              Delete ({selectedAlarms.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalTitle}>Delete This Alarm?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this alarm?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAlarm}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#000',
  },
  addAlarmButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  addAlarmButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  alarmsListContainer: {
    flex: 1,
  },
  savedAlarmItem: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmDetails: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 30,
    color: '#000',
  },
  alarmRepeat: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  noAlarmsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  customSwitchTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    justifyContent: 'center',
    padding: 2,
  },
  customSwitchTrackActive: {
    backgroundColor: '#3A4A5A',
  },
  customSwitchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    transform: [{ translateX: 2 }],
  },
  customSwitchThumbActive: {
    transform: [{ translateX: 22 }],
    backgroundColor: '#AFCBFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: width * 0.85,
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#444',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
  },
  deleteButton: {
    backgroundColor: '#D94343',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000', // Pure black background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333', // Subtle border
  },
  
  cancelMultiSelectButton: {
    padding: 10,
  },
  
  selectAllButton: {
    padding: 10,
  },
  
  deleteMultiSelectButton: {
    backgroundColor: '#000', // Match background
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  bottomBarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // White text on black background
  },
  
});

export default Alarm;
