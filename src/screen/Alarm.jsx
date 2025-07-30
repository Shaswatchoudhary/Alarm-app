import React, { useEffect, useState } from 'react';
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

const { width } = Dimensions.get('window');

const Alarm = ({ navigation }) => {
  const [savedAlarms, setSavedAlarms] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const scaleAnim = new Animated.Value(0.9);

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
        <Text style={styles.headerText}>Alarm</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AlarmListScreen')}
          style={styles.addAlarmButton}
        >
          <Text style={styles.addAlarmButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Alarm List */}
      <ScrollView style={styles.alarmsListContainer}>
        {savedAlarms.length > 0 ? (
          savedAlarms.map((alarm) => (
            <TouchableOpacity
              key={alarm.id}
              style={styles.savedAlarmItem}
              onPress={() => handleEdit(alarm)}
              onLongPress={() => showDeleteModal(alarm.id)}
              delayLongPress={500}
            >
              <View style={styles.alarmDetails}>
                <Text style={styles.alarmTime}>
                  {alarm.hour || '00'}:{alarm.minute || '00'}
                </Text>
                <Text style={styles.alarmRepeat}>
                  {alarm.repeat?.length > 0 ? alarm.repeat.join(', ') : 'No Repeat'}
                </Text>
              </View>

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
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noAlarmsText}>
            No alarms set yet. Tap '+' to create one!
          </Text>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        {/* delete alet msg will show here */}
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
};

export default Alarm;

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
    backgroundColor: '#34C759',
  },
  customSwitchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    transform: [{ translateX: 2 }],
  },
  customSwitchThumbActive: {
    transform: [{ translateX: 22 }],
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
});
