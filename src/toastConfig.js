import { Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';

const colorScheme = Appearance.getColorScheme();

const ToastBox = ({ icon, iconColor, bgColor, text1, text2 }) => (
  <View
    style={{
      minHeight: 80,
      width: '92%',
      backgroundColor: bgColor,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 6,
      elevation: 4,
      alignSelf: 'center',
      marginBottom: 30,
    }}
  >
    <Ionicons name={icon} size={32} color={iconColor} style={{ marginRight: 14 }} />
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 4,
        }}
      >
        {text1}
      </Text>
      {text2 ? (
        <Text style={{ color: '#f1f1f1', fontSize: 14 }}>{text2}</Text>
      ) : null}
    </View>
  </View>
);

export const toastConfig = {
  success: ({ text1, text2 }) =>
    ToastBox({
      icon: 'checkmark-circle',
      iconColor: '#fff',
      bgColor: '#4BB543',
      text1,
      text2,
    }),
  error: ({ text1, text2 }) =>
    ToastBox({
      icon: 'close-circle',
      iconColor: '#fff',
      bgColor: '#D94343',
      text1,
      text2,
    }),
  info: ({ text1, text2 }) =>
    ToastBox({
      icon: 'information-circle',
      iconColor: '#fff',
      bgColor: colorScheme === 'dark' ? '#444' : '#3A86FF',
      text1,
      text2,
    }),
};
