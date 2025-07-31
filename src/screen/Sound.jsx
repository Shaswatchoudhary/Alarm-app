import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Sound = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sound</Text>
    </View>
  );
};

export default Sound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#000',
  },
});
