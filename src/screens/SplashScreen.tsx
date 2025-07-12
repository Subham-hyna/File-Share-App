import { View, Text, Image, StyleSheet, Animated, StatusBar } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { navigate } from '../utils/NavigationUtil'
import { commonStyles } from '../styles/CommonStyles'
import { Colors, screenWidth, Spacing } from '../utils/Constants'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '../components/global/Icon'

const SplashScreen = () => {
  const insets = useSafeAreaInsets()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const iconRotateAnim = useRef(new Animated.Value(0)).current

  const navigateToHome = () => {
    navigate('Home')
  }

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      })
    ]).start()

    const timeoutId = setTimeout(() => {
      navigateToHome()
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [])

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2, Colors.secondary]}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: iconRotation }]
              }
            ]}
          >
            <Icon 
              name="airplane" 
              size={80} 
              color={Colors.surface} 
              iconFamily="Ionicons" 
            />
          </Animated.View>
          <Text style={styles.appName}>File Fly</Text>
          <Text style={styles.tagline}>Share with ease</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logo: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    resizeMode: 'contain',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.surface,
    fontFamily: 'Okra-Bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: Colors.surface,
    fontFamily: 'Okra-Medium',
    opacity: 0.9,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

export default SplashScreen