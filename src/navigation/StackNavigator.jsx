import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screen/Home';  
import AlarmListScreen from '../screen/AlarmListScreen';
import Sound from '../screen/Sound';
import TimerScreen from '../screen/TimerScreen';
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
      <Stack.Screen name="AlarmListScreen"  component={AlarmListScreen} 
       options={{
        title: 'Add Alarm', 
        headerStyle: {
          backgroundColor: '#fff', 
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      />
      <Stack.Screen name="Sound" component={Sound} 
       options={{
        title: 'Sound',
      }}
      />
      <Stack.Screen name="TimerScreen" component={TimerScreen} 
       options={{
        title: 'Timer',
      }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
