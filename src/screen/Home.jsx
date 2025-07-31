import React, { useState, useLayoutEffect, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons'; // Import Feather icons for the plus symbol
import ClockHeader from './ClockHeader';

const { width, height } = Dimensions.get('window');

// Twinkling Stars (Reduced count for performance)
const TWINKLING_STAR_COUNT = 35; // Optimized from 70
const TWINKLING_STAR_SIZE_MIN = 2;
const TWINKLING_STAR_SIZE_MAX = 4; // Slightly smaller max size for less render complexity
const TWINKLE_DURATION_MIN = 900; // ms - Slightly adjusted
const TWINKLE_DURATION_MAX = 2000; // ms - Slightly adjusted
const MAX_STAR_OPACITY = 0.8; // Slightly lower max opacity
const MIN_STAR_OPACITY = 0.2; // Slightly lower min opacity

// Moving Clouds (Reduced count and size for performance)
const CLOUD_COUNT = 3; // Optimized from 4
const CLOUD_WIDTH_MIN = 70; // Slightly smaller min width
const CLOUD_WIDTH_MAX = 130; // Slightly smaller max width
const CLOUD_HEIGHT_MIN = 25; // Slightly smaller min height
const CLOUD_HEIGHT_MAX = 50; // Slightly smaller max height
const CLOUD_SPEED_MIN = 35000; // ms - Slightly longer duration for less frequent updates
const CLOUD_SPEED_MAX = 65000; // ms

// Falling Stars (Reduced count and simplified properties)
const FALLING_STAR_COUNT = 2; // Optimized from 3
const FALLING_STAR_SIZE = 2.5; // Slightly smaller
const FALLING_STAR_LENGTH = 25; // Slightly shorter tail for less shadow complexity
const FALLING_STAR_DURATION = 1200; // ms - Slightly faster fall
const FALLING_STAR_INTERVAL = 6000; // ms - Slightly longer interval between triggers

const Home = ({ navigation }) => {
  const [time, setTime] = useState(new Date());

  // --- Calculate Initial Celestial Body Position for Smooth Start ---
  // This helps prevent any initial jump or "top error" on first render
  const initialTime = new Date();
  const initialHour = initialTime.getHours() + initialTime.getMinutes() / 60;
  const initialProgress = initialHour / 24;
  const initialArcHeight = height * 0.3;
  const initialTargetX = initialProgress * width;
  const initialTargetY = (height * 0.2) + (-4 * initialArcHeight * Math.pow(initialProgress - 0.5, 2));

  // Animated values for the celestial body's position (Sun/Moon)
  const sunTranslateX = useRef(new Animated.Value(initialTargetX)).current;
  const sunTranslateY = useRef(new Animated.Value(initialTargetY)).current;

  // Animated values for the celestial body's glow effect
  const sunGlowScaleAnim = useRef(new Animated.Value(0)).current;
  const sunGlowOpacityAnim = useRef(new Animated.Value(0)).current;

  // Refs for Twinkling Stars
  const twinklingStarAnimations = useRef([]).current; // Array of Animated.Value for opacity
  const twinklingStarData = useRef([]).current; // Array of static star properties (pos, size)

  // Refs for Moving Clouds
  const cloudTranslations = useRef([]).current; // Array of Animated.Value for translateX
  const cloudData = useRef([]).current; // Array of static cloud properties (pos, size, speed)

  // Refs for Falling Stars
  const fallingStarTranslations = useRef([]).current; // Array of Animated.Value for translateY
  const fallingStarOpacities = useRef([]).current; // Array of Animated.Value for opacity
  const fallingStarData = useRef([]).current; // Array of static falling star properties (initial pos, size)

  // Determine current time-based properties
  const hour = time.getHours();
  const isNight = hour >= 20 || hour < 5;

  // Gradient colors based on time of day
  const gradientColors = hour >= 5 && hour < 8
    ? ['#ffcf6b', '#ffeaaa'] // Dawn
    : hour >= 8 && hour < 17
    ? ['#87cefa', '#e0f2f7'] // Day
    : hour >= 17 && hour < 20
    ? ['#f3904f', '#3b4371'] // Sunset
    : ['#0f2027', '#203a43', '#2c5364']; // Night

  const celestialColor = isNight ? '#dbe2ef' : '#FDB813'; // Moon or Sun color
  const shadowColor = isNight ? '#9eabbe' : '#FFD700'; // Softer glow for moon, intense for sun

  // --- Effect for Twinkling Stars Initialization and Animation ---
  // Runs once on mount to set up persistent star data and their twinkling loops.
  useEffect(() => {
    if (twinklingStarData.length === 0) { // Only initialize if not already done
      for (let i = 0; i < TWINKLING_STAR_COUNT; i++) {
        const size = Math.random() * (TWINKLING_STAR_SIZE_MAX - TWINKLING_STAR_SIZE_MIN) + TWINKLING_STAR_SIZE_MIN;
        twinklingStarData.push({
          id: `twinkle-${i}`,
          left: Math.random() * width,
          top: Math.random() * height,
          size,
        });
        const opacity = new Animated.Value(MIN_STAR_OPACITY); // Initialize with min opacity
        twinklingStarAnimations.push(opacity);
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: MAX_STAR_OPACITY,
              duration: TWINKLE_DURATION_MIN + Math.random() * (TWINKLE_DURATION_MAX - TWINKLE_DURATION_MIN),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true, // Opacity animations support native driver
            }),
            Animated.timing(opacity, {
              toValue: MIN_STAR_OPACITY,
              duration: TWINKLE_DURATION_MIN + Math.random() * (TWINKLE_DURATION_MAX - TWINKLE_DURATION_MIN),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, []); // Empty dependency array means this runs only once on mount

  // --- Effect for Moving Clouds Initialization and Animation ---
  // Runs once on mount to set up persistent cloud data and their movement loops.
  useEffect(() => {
    if (cloudData.length === 0) { // Only initialize if not already done
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const cloudWidth = Math.random() * (CLOUD_WIDTH_MAX - CLOUD_WIDTH_MIN) + CLOUD_WIDTH_MIN;
        const cloudHeight = Math.random() * (CLOUD_HEIGHT_MAX - CLOUD_HEIGHT_MIN) + CLOUD_HEIGHT_MIN;
        const y = Math.random() * height * 0.3; // Clouds appear in the upper third of the screen
        const speed = Math.random() * (CLOUD_SPEED_MAX - CLOUD_SPEED_MIN) + CLOUD_SPEED_MIN;

        cloudData.push({ id: `cloud-${i}`, width: cloudWidth, height: cloudHeight, y });
        // Initialize translateX to a random position, potentially off-screen right
        const translateX = new Animated.Value(width + Math.random() * 200);

        cloudTranslations.push(translateX);

        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: -cloudWidth, // Move off-screen left
              duration: speed,
              useNativeDriver: true, // `translateX` supports native driver
              easing: Easing.linear,
            }),
            Animated.timing(translateX, {
              toValue: width + 100, // Instantly reset to off-screen right
              duration: 0, // Instant jump
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, []); // Empty dependency array means this runs only once on mount

  // --- Effect for Falling Stars Initialization and Animation Trigger ---
  // Sets up falling star data and an interval to trigger their animations.
  useEffect(() => {
    if (fallingStarData.length === 0) { // Only initialize if not already done
      for (let i = 0; i < FALLING_STAR_COUNT; i++) {
        const x = Math.random() * width;
        const yStart = -FALLING_STAR_LENGTH - Math.random() * 100; // Start above screen with random offset
        fallingStarData.push({ id: `falling-${i}`, x, yStart });
        fallingStarTranslations.push(new Animated.Value(yStart)); // Initialize off-screen
        fallingStarOpacities.push(new Animated.Value(0)); // Initialize invisible
      }
    }

    let fallingStarIndex = 0;
    const interval = setInterval(() => {
      // Only trigger falling stars if it's night time
      if (!isNight) return;

      const i = fallingStarIndex % FALLING_STAR_COUNT;
      const { x, yStart } = fallingStarData[i];

      // Reset star to its starting position and make it visible before animating
      fallingStarTranslations[i].setValue(yStart);
      fallingStarOpacities[i].setValue(1);

      Animated.parallel([
        Animated.timing(fallingStarTranslations[i], {
          toValue: height + FALLING_STAR_LENGTH, // Fall off the bottom of the screen
          duration: FALLING_STAR_DURATION,
          easing: Easing.linear,
          useNativeDriver: true, // `translateY` supports native driver
        }),
        Animated.timing(fallingStarOpacities[i], {
          toValue: 0, // Fade out as it falls
          duration: FALLING_STAR_DURATION,
          easing: Easing.linear,
          useNativeDriver: true, // Opacity animations support native driver
        }),
      ]).start();

      fallingStarIndex++; // Move to the next falling star in the pool
    }, FALLING_STAR_INTERVAL); // Interval for triggering new falling stars

    // Cleanup: Clear the interval when the component unmounts or `isNight` changes
    return () => clearInterval(interval);
  }, [isNight]); // Dependency on `isNight` to restart/stop interval when day/night changes

  // --- Layout Effect for Time Updates and Celestial Body Animation ---
  // This effect runs synchronously after all DOM mutations to ensure smooth initial positioning.
  useLayoutEffect(() => {
    const updateTimeAndAnimate = () => {
      const now = new Date();
      setTime(now);
      animateCelestialBody(now); // Animate celestial body based on current time
    };

    updateTimeAndAnimate(); // Initial call to set position and start animation
    const interval = setInterval(updateTimeAndAnimate, 60000); // Update every minute to reduce updates

    // Cleanup: Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs only once on mount

  // --- Callback for Celestial Body and Glow Animation ---
  // This function calculates and animates the position of the sun/moon and its glow.
  const animateCelestialBody = useCallback((now) => {
    const hour = now.getHours() + now.getMinutes() / 60; // Current hour with minute fraction
    const progress = hour / 24; // Normalized progress from 0 to 1 over 24 hours

    // Calculate X and Y positions for an arc-like path
    const targetX = progress * width;
    const arcHeight = height * 0.3;
    const targetY = (height * 0.2) + (-4 * arcHeight * Math.pow(progress - 0.5, 2));

    // --- Glow Animation Logic (Morning/Rising Vibe) ---
    let glowScaleTarget = 0;
    let glowOpacityTarget = 0;

    if (hour >= 4 && hour < 9) { // Dawn to early morning (4 AM - 9 AM)
      const dawnProgress = (hour - 4) / 5; // Progress from 0 to 1 over 5 hours
      glowScaleTarget = 0.5 + dawnProgress * 0.5; // Scale from 0.5 to 1.0
      glowOpacityTarget = 0.3 + dawnProgress * 0.7; // Opacity from 0.3 to 1.0
    } else if (hour >= 9 && hour < 16) { // Midday (9 AM - 4 PM)
      glowScaleTarget = 0.5; // Constant smaller glow during peak day
      glowOpacityTarget = 0.5;
    } else if (hour >= 16 && hour < 21) { // Afternoon to sunset (4 PM - 9 PM)
      const sunsetProgress = (hour - 16) / 5; // Progress from 0 to 1 over 5 hours
      glowScaleTarget = 1.0 - sunsetProgress * 0.5; // Scale from 1.0 down to 0.5
      glowOpacityTarget = 1.0 - sunsetProgress * 0.7; // Opacity from 1.0 down to 0.3
    } else { // Night (9 PM - 4 AM)
      glowScaleTarget = 0; // No glow at night
      glowOpacityTarget = 0;
    }

    // Run all animations in parallel for smooth transitions
    Animated.parallel([
      // Celestial body position animation (using translateX/Y for native driver support)
      Animated.timing(sunTranslateX, {
        toValue: targetX,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true, // `translateX` supports native driver
      }),
      Animated.timing(sunTranslateY, {
        toValue: targetY,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true, // `translateY` supports native driver
      }),
      // Sun glow scale animation
      Animated.timing(sunGlowScaleAnim, {
        toValue: glowScaleTarget,
        duration: 1000,
        useNativeDriver: true, // Scale animations support native driver
        easing: Easing.inOut(Easing.ease),
      }),
      // Sun glow opacity animation
      Animated.timing(sunGlowOpacityAnim, {
        toValue: glowOpacityTarget,
        duration: 1000,
        useNativeDriver: true, // Opacity animations support native driver
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  }, [sunTranslateX, sunTranslateY, sunGlowScaleAnim, sunGlowOpacityAnim]); // Dependencies for useCallback

  // Memoized navigation callback for performance
  const navigateToAlarmList = useCallback(() => {
    navigation.navigate('AlarmListScreen');
  }, [navigation]);

  // Determine the FAB background color based on time of day
  const fabBackgroundColor = isNight ? '#203a43' : '#3498DB'; // A subtle dark blue for night, vibrant blue for day
  const fabIconColor = '#fff'; // Icon color always white for contrast

  return (
    <LinearGradient colors={gradientColors} style={styles.screenGradient}>
      {/* --- Twinkling Stars (Visible only at Night Time) --- */}
      {isNight && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {twinklingStarData.map((star, i) => (
            <Animated.View
              key={star.id}
              style={{
                position: 'absolute',
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: 'white',
                opacity: twinklingStarAnimations[i],
              }}
            />
          ))}
        </View>
      )}
      {/* --- Falling Stars (Visible only at Night Time) --- */}
      {isNight && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {fallingStarData.map((star, i) => (
            <Animated.View
              key={star.id}
              style={{
                position: 'absolute',
                left: star.x,
                transform: [{ translateY: fallingStarTranslations[i] }], // Animated Y position
                opacity: fallingStarOpacities[i], // Animated opacity
                width: FALLING_STAR_SIZE,
                height: FALLING_STAR_SIZE,
                borderRadius: FALLING_STAR_SIZE / 2,
                backgroundColor: 'white',
                // Optimized: Less intense shadow for performance
                shadowColor: 'white',
                shadowOffset: { width: 0, height: FALLING_STAR_LENGTH * 0.8 }, // Shorter tail
                shadowOpacity: 0.4, // Reduced opacity
                shadowRadius: 4, // Reduced radius
              }}
            />
          ))}
        </View>
      )}
      {/* --- Moving Clouds (Visible only during Day Time) --- */}
      {!isNight && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {cloudData.map((cloud, i) => (
            <Animated.View
              key={cloud.id}
              style={[styles.cloud, {
                width: cloud.width,
                height: cloud.height,
                top: cloud.y,
                transform: [{ translateX: cloudTranslations[i] }], // Animated X position
              }]}
            />
          ))}
        </View>
      )}
      {/* --- Sun/Moon Glow Effect (positioned behind the celestial body) --- */}
      <Animated.View
        style={[styles.celestialGlow, {
          backgroundColor: celestialColor, // Glow color matches celestial body
          opacity: sunGlowOpacityAnim, // Animated opacity for fading in/out
          transform: [
            { translateX: sunTranslateX }, // Positioned with celestial body's X
            { translateY: sunTranslateY }, // Positioned with celestial body's Y
            { scale: sunGlowScaleAnim }, // Animated scale for expansion/contraction
          ],
        }]}
      />
      {/* --- Sun or Moon (Celestial Body) --- */}
      <Animated.View
        style={[styles.celestialBody, {
          backgroundColor: celestialColor, // Celestial body color
          transform: [
            { translateX: sunTranslateX }, // Animated X position
            { translateY: sunTranslateY }, // Animated Y position
          ],
          shadowColor, // Shadow color matches celestial body
          // Optimized: Reduced shadow properties for better performance on low-end devices
          shadowOpacity: isNight ? 0.6 : 0.7, // Slightly reduced
          shadowRadius: isNight ? 15 : 10, // Significantly reduced for sun (was 20)
          ...Platform.select({ android: { elevation: isNight ? 5 : 8 } }), // Android specific shadow (Reduced from 8/15)
        }]}
      />
      {/* --- Main Content Container (Header & Time) --- */}
      {/* This container uses flex: 1 to take up available vertical space and centers its content */}
      <View style={styles.contentContainer}>
        {/* Time */}
        {/* Moved time above header as per requirement */}
        {/* <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View> */}
        {/* Header (Clock text) */}
        <ClockHeader />
      </View>

      {/* --- Floating Action Button (FAB) for Add Alarm --- */}
      <TouchableOpacity
        style={[styles.addAlarmFAB, { backgroundColor: fabBackgroundColor }]}
        onPress={navigateToAlarmList}
      >
        <Feather name="plus" size={30} color={fabIconColor} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  screenGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1, // Takes up all available space
    justifyContent: 'center', // Vertically centers its children
    alignItems: 'center', // Horizontally centers its children
    paddingBottom: Platform.OS === 'ios' ? 80 : 70, // Adjust padding from bottom to lift content above FAB
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 5, // Small margin between time and "Clock" text
  },
  headerText: {
    fontSize: 50, // Slightly reduced for better hierarchy with time
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white for a soft, professional look
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1.5,
    fontVariant: ['small-caps'], // Makes the "Clock" text look more stylized (if supported)
  },
  timeContainer: {
    alignItems: 'center',
    // No top margin needed here as it's the first element in the centered column
  },
  timeText: {
    fontSize: 92, // Significantly larger for maximum impact and readability
    fontWeight: '900', // Extra bold for strong presence
    color: '#FFFFFF', // Pure white for crispness
    textShadowColor: 'rgba(0, 0, 0, 0.6)', // Deeper shadow for more punch
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 10,
    // Enhanced glow effect for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#87CEFA', // Sky blue for a vibrant, cool glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 15, // Larger radius for a more diffused glow
      },
      android: {
        // Android equivalent for a subtle glow with elevation (already in celestialBody)
        // You might consider a custom text shadow library for more advanced Android text glow
      }
    }),
  },

  addAlarmFAB: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: (width / 2) - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  celestialBody: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 2,
  },
  celestialGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 1,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});