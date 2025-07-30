import React, { useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-toast-message';
import TabNavigator from './src/navigation/TabNavigator';
import { toastConfig } from './src/toastConfig';

export default function App() {
  const initialScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(initialScheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
      console.log('Color scheme changed to:', colorScheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootSiblingParent>
        <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <TabNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
