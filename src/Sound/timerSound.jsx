// src/sounds/timerSound.js
import { Audio } from 'expo-av';

let sound;

export const playTimerSound = async () => {
  try {
    sound = new Audio.Sound();
    await sound.loadAsync(require('../../assets/sounds/ringtone.mp3')); // ← Use your timer sound here
    await sound.setIsLoopingAsync(true);
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing timer sound:', error);
  }
};

export const stopTimerSound = async () => {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error stopping timer sound:', error);
  }
};
