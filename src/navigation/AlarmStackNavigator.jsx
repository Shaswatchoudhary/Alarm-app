import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Alarm from '../screen/Alarm';
import AlarmListScreen from '../screen/AlarmListScreen';

const Stack = createNativeStackNavigator();

const AlarmStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Alarm">
      {/* Alarm Main Screen (list of alarms) */}
      <Stack.Screen
        name="Alarm"
        component={Alarm}
        options={{ headerShown: false }}
      />

      {/* Add/Edit Alarm Screen */}
      <Stack.Screen
        name="AlarmListScreen"
        component={AlarmListScreen}
        options={{
          title: 'Add / Edit Alarm',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AlarmStackNavigator;
