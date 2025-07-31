import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const ClockHeader = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const colonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const date = now.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });

      setCurrentTime(time);
      setCurrentDate(date);
    };

    updateTime();

    // Animation for slide and fade-in on first load
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    // Blinking colon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(colonOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(colonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [hour, minute] = currentTime.split(':');

  return (
    <Animated.View
    style={[
      styles.headerContainer,
      {
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
      },
    ]}
  >
    <Text style={styles.headerText}>Clock</Text> 
  
    <View style={styles.timeContainer}>
      <View style={styles.timeRow}>
        <Text style={styles.timeDigit}>{hour}</Text>
        <Animated.Text style={[styles.colon, { opacity: colonOpacity }]}>:</Animated.Text>
        <Text style={styles.timeDigit}>{minute}</Text>
      </View>
      
      {/* Current date in small text */}
      <Text style={styles.subText}>{currentDate}</Text>
    </View>
  </Animated.View>
  
  );
};

export default ClockHeader;

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigit: {
    fontSize: 84,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  colon: {
    fontSize: 84,
    fontWeight: '900',
    color: '#fff',
    marginHorizontal: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
});

