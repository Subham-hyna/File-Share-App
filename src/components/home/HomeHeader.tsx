import { View, Text, SafeAreaView, TouchableOpacity, Image, Animated, Platform, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { homeHeaderStyles } from '../../styles/homeHeaderStyles'
import { commonStyles } from '../../styles/CommonStyles'
import Icon from '../global/Icon'
import LinearGradient from 'react-native-linear-gradient'
import QRGenerateModal from '../modals/QRGenerateModal'
import { Colors } from '../../utils/Constants'

const HomeHeader = () => {
    const [isQRModalVisible, setIsQRModalVisible] = useState(false)
    const [scaleAnim] = useState(new Animated.Value(1))
    const [fadeAnim] = useState(new Animated.Value(0))
    const [pulseAnim] = useState(new Animated.Value(1))

    useEffect(() => {
        // Fade in animation on mount
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start()

        // Pulse animation for QR button
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
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

        return () => pulseAnimation.stop()
    }, [])

    const handleQRPress = () => {
        // Scale animation for QR button
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()
        
        setIsQRModalVisible(true)
    }

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Animated.View style={[homeHeaderStyles.mainContainer, { opacity: fadeAnim }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={['#007AFF', '#0056CC', '#003E99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={homeHeaderStyles.gradientContainer}
            >
                <SafeAreaView />
                <View style={[commonStyles.flexRowBetween, homeHeaderStyles.container]}>
                    {/* App Title Section */}
                    <View style={homeHeaderStyles.titleSection}>
                        <View style={homeHeaderStyles.appIconContainer}>
                            <Icon name="airplane" size={28} color="#FFFFFF" iconFamily="Ionicons" />
                        </View>
                        <View style={homeHeaderStyles.titleContainer}>
                            <Text style={homeHeaderStyles.appName}>File Fly</Text>
                            <Text style={homeHeaderStyles.appTagline}>Share with ease</Text>
                        </View>
                    </View>

                    {/* Status and Actions Section */}
                    <View style={homeHeaderStyles.actionsSection}>
                        <View style={homeHeaderStyles.statusContainer}>
                            <Text style={homeHeaderStyles.timeText}>{getCurrentTime()}</Text>
                            <View style={homeHeaderStyles.statusIndicator}>
                                <View style={homeHeaderStyles.onlineIndicator} />
                                <Text style={homeHeaderStyles.statusText}>Ready</Text>
                            </View>
                        </View>

                        {/* QR Code Button */}
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity 
                                style={homeHeaderStyles.qrButton}
                                activeOpacity={0.7}
                                onPress={handleQRPress}
                            >
                                <View style={homeHeaderStyles.qrIconContainer}>
                                    <Icon name="qr-code" size={24} color="#FFFFFF" iconFamily="Ionicons" />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
                
                {/* Welcome Message */}
                <View style={homeHeaderStyles.welcomeSection}>
                    <Text style={homeHeaderStyles.welcomeText}>
                        Welcome back! Ready to share files?
                    </Text>
                </View>
                
                {/* Decorative Elements */}
                <View style={homeHeaderStyles.decorativeContainer}>
                    <View style={homeHeaderStyles.circle1} />
                    <View style={homeHeaderStyles.circle2} />
                    <View style={homeHeaderStyles.circle3} />
                </View>
            </LinearGradient>
            
            {/* QR Generate Modal */}
            <QRGenerateModal 
                visible={isQRModalVisible}
                onClose={() => setIsQRModalVisible(false)}     
            />
        </Animated.View>
    )
}

export default HomeHeader