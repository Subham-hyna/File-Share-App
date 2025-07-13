import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icon from '../global/Icon'
import { Colors } from '../../utils/Constants'
import { RFValue } from 'react-native-responsive-fontsize'

const { width, height } = Dimensions.get('window')

const Misc = () => {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [pulseAnim] = useState(new Animated.Value(1))

  // Daily quotes array
  const dailyQuotes = [
    "Sharing is caring, and caring is sharing! 💙",
    "Every file shared is a bridge built between hearts 🌉",
    "In the digital age, generosity comes in bytes and megabytes 📱",
    "File Fly makes distance disappear, one file at a time ✈️",
    "Connection is the currency of the connected world 🌍",
    "Share your files, share your world 🌟",
    "Technology brings us closer, one transfer at a time 🤝",
    "Files are just data, but sharing them creates memories 💫"
  ]

  const [currentQuote, setCurrentQuote] = useState(dailyQuotes[0])

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for quote
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    )
    pulseAnimation.start()

    // Change quote every 5 seconds
    const quoteInterval = setInterval(() => {
      const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
      setCurrentQuote(randomQuote)
    }, 5000)

    return () => {
      pulseAnimation.stop()
      clearInterval(quoteInterval)
    }
  }, [])

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F1F3F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Daily Quote Card */}
        <Animated.View style={[
          styles.quoteCard,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <View style={styles.quoteIconContainer}>
              <Icon name="heart" size={24} color="#FFFFFF" iconFamily="Ionicons" />
            </View>
            <View style={styles.quoteContent}>
              <Text style={styles.quoteTitle}>Daily Inspiration</Text>
              <Text style={styles.quoteText}>{currentQuote}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* App Version Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>File Fly v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for seamless file sharing</Text>
        </View>

        {/* Floating Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
          <View style={[styles.decorativeCircle, styles.circle4]} />
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  quoteCard: {
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  quoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  quoteIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quoteContent: {
    flex: 1,
  },
  quoteTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    fontFamily: 'Okra-Bold',
  },
  quoteText: {
    fontSize: RFValue(12),
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
    fontFamily: 'Okra-Regular',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: RFValue(12),
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Okra-Medium',
  },
  footerSubtext: {
    fontSize: RFValue(10),
    color: Colors.text,
    opacity: 0.6,
    fontFamily: 'Okra-Regular',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.08,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: '#667eea',
    top: 100,
    right: -30,
  },
  circle2: {
    width: 60,
    height: 60,
    backgroundColor: '#764ba2',
    top: 200,
    left: -20,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: '#f093fb',
    bottom: 150,
    right: 20,
  },
  circle4: {
    width: 40,
    height: 40,
    backgroundColor: '#f5576c',
    bottom: 250,
    left: 10,
  },
})

export default Misc