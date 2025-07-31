import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import StackNavigator from './StackNavigator';
import AlarmStackNavigator from './AlarmStackNavigator';
import TimerScreen from '../screen/TimerScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        // Select icon based on route name
        let iconName;
        if (route.name === 'HomeTab') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'AlarmTab') {
          iconName = isFocused ? 'alarm' : 'alarm-outline';
        } else if (route.name === 'TimerTab') {
          iconName = isFocused ? 'timer' : 'timer-outline';
        }

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.85}
          >
            <Ionicons
              name={iconName}
              size={26}
              color={isFocused ? '#1E90FF' : '#888'}
            />
            <Text style={[styles.label, { color: isFocused ? '#1E90FF' : '#888' }]}>
              {label.replace('Tab', '')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="HomeTab"
        component={StackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="AlarmTab"
        component={AlarmStackNavigator}
        options={{ title: 'Alarm' }}
      />
      <Tab.Screen
        name="TimerTab"
        component={TimerScreen}
        options={{ title: 'Timer' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 65,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
