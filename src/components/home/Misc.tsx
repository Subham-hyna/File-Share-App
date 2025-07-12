import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icon from '../global/Icon'
import { Colors, screenWidth } from '../../utils/Constants'
import { RFValue } from 'react-native-responsive-fontsize'

const { width, height } = Dimensions.get('window')

const Misc = () => {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [scaleAnims] = useState([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ])
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

  const handleCardPress = (index: number, action: string) => {
    // Scale animation for card press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    
    console.log(`${action} pressed`)
    // Add your action logic here
  }

  const miscOptions = [
    {
      title: 'Theme Settings',
      subtitle: 'Dark/Light mode',
      icon: 'color-palette-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#FF6B6B', '#FF5252'],
      action: 'theme'
    },
    {
      title: 'Display Preferences',
      subtitle: 'Font size & layout',
      icon: 'resize-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#4ECDC4', '#26A69A'],
      action: 'display'
    },
    {
      title: 'Language',
      subtitle: 'Choose your language',
      icon: 'language-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#45B7D1', '#1E88E5'],
      action: 'language'
    },
    {
      title: 'Notifications',
      subtitle: 'Manage alerts',
      icon: 'notifications-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#FFA726', '#FF9800'],
      action: 'notifications'
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Data protection',
      icon: 'shield-checkmark-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#66BB6A', '#4CAF50'],
      action: 'privacy'
    },
    {
      title: 'Storage Management',
      subtitle: 'Clean up files',
      icon: 'folder-open-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#AB47BC', '#9C27B0'],
      action: 'storage'
    },
    {
      title: 'Rate File Fly',
      subtitle: 'Love the app? Rate us!',
      icon: 'star-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#FFCA28', '#FFC107'],
      action: 'rate'
    },
    {
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: 'help-circle-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#7986CB', '#3F51B5'],
      action: 'help'
    },
    {
      title: 'About File Fly',
      subtitle: 'App info & version',
      icon: 'information-circle-outline',
      iconFamily: 'Ionicons' as const,
      colors: ['#8D6E63', '#5D4037'],
      action: 'about'
    },
  ]

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
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconContainer}
          >
            <Icon name="options-outline" size={28} color="#FFFFFF" iconFamily="Ionicons" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Preferences</Text>
          <Text style={styles.headerSubtitle}>Customize your File Fly experience</Text>
        </View>

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

        {/* Cards Grid */}
        <View style={styles.cardsContainer}>
          {miscOptions.map((option, index) => (
            <Animated.View
              key={index}
              style={[
                styles.cardWrapper,
                { transform: [{ scale: scaleAnims[index] }] }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCardPress(index, option.action)}
                style={styles.cardTouchable}
              >
                <LinearGradient
                  colors={option.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.cardIconContainer}>
                    <Icon 
                      name={option.icon} 
                      size={24} 
                      color="#FFFFFF" 
                      iconFamily={option.iconFamily} 
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{option.title}</Text>
                    <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                  </View>
                  <View style={styles.cardArrow}>
                    <Icon 
                      name="chevron-forward" 
                      size={18} 
                      color="#FFFFFF" 
                      iconFamily="Ionicons" 
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

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
    paddingTop: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTitle: {
    fontSize: RFValue(26),
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
    fontFamily: 'Okra-Bold',
  },
  headerSubtitle: {
    fontSize: RFValue(14),
    color: Colors.text,
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: 'Okra-Regular',
  },
  quoteCard: {
    marginBottom: 25,
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
  cardsContainer: {
    flex: 1,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 2,
  },
  cardTouchable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
    fontFamily: 'Okra-Bold',
  },
  cardSubtitle: {
    fontSize: RFValue(11),
    color: '#FFFFFF',
    opacity: 0.85,
    fontFamily: 'Okra-Regular',
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
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