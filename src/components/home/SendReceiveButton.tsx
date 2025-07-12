import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Colors, screenWidth, Shadows, BorderRadius, Spacing } from '../../utils/Constants'
import { navigate } from '../../utils/NavigationUtil'
import LinearGradient from 'react-native-linear-gradient'
import Icon from '../global/Icon'

const SendReceiveButton = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  const handleSendPress = () => {
    navigate('Send')
  }

  const handleReceivePress = () => {
    navigate('Receive')
  }

  const createPressAnimation = () => {
    const scaleValue = new Animated.Value(1)
    return {
      pressIn: () => {
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start()
      },
      pressOut: () => {
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      },
      scaleValue
    }
  }

  const sendAnimation = createPressAnimation()
  const receiveAnimation = createPressAnimation()

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: sendAnimation.scaleValue }] }
        ]}
      >
        <TouchableOpacity 
          onPress={handleSendPress}
          onPressIn={sendAnimation.pressIn}
          onPressOut={sendAnimation.pressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.gradient1, Colors.gradient2]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name="paper-plane" 
                size={28} 
                color={Colors.surface} 
                iconFamily="Ionicons" 
              />
            </View>
            <Text style={styles.buttonText}>Send</Text>
            <Text style={styles.buttonSubtext}>Share files with others</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: receiveAnimation.scaleValue }] }
        ]}
      >
        <TouchableOpacity 
          onPress={handleReceivePress}
          onPressIn={receiveAnimation.pressIn}
          onPressOut={receiveAnimation.pressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.gradient3, Colors.gradient4]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name="download" 
                size={28} 
                color={Colors.surface} 
                iconFamily="Ionicons" 
              />
            </View>
            <Text style={styles.buttonText}>Receive</Text>
            <Text style={styles.buttonSubtext}>Get files from others</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...Shadows.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: Spacing.xs,
    fontFamily: 'Okra-Bold'
  },
  buttonSubtext: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Okra-Regular'
  },
})

export default SendReceiveButton