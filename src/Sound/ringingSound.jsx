import { Audio } from 'expo-av';

let sound = null;

export const playAlarmSound = async () => {
  try {
    // Stop any existing sound first
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }

    // Set audio mode for alarm
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true, // Important: Play even when phone is on silent
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/ringing.mp3'), // Update this path to your alarm sound file
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      }
    );

    sound = newSound;
    
    // Additional check to ensure sound is loaded before setting properties
    if (sound) {
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(1.0);
      console.log('Alarm sound started successfully');
    }

  } catch (error) {
    console.error('Error playing alarm sound:', error);
    
    // Fallback: Try to play a system sound
    try {
      const { sound: fallbackSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }, // Online fallback
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      sound = fallbackSound;
      console.log('Playing fallback alarm sound');
    } catch (fallbackError) {
      console.error('Fallback sound also failed:', fallbackError);
      throw error; // Re-throw original error
    }
  }
};

export const stopAlarmSound = async () => {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
      console.log('Alarm sound stopped successfully');
    }
  } catch (error) {
    console.error('Error stopping alarm sound:', error);
    // Force reset sound object even if stopping fails
    sound = null;
  }
};

// Cleanup function for app state changes
export const cleanupSound = async () => {
  if (sound) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error during sound cleanup:', error);
    } finally {
      sound = null;
    }
  }
};