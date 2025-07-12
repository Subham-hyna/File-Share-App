import { View, Text, TouchableOpacity, Image, Animated , Easing, Alert, ActivityIndicator, StyleSheet, StatusBar} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTCP } from '../service/TCPProvider';
import LinearGradient from 'react-native-linear-gradient';
import QRScannerModal from '../components/modals/QRScannerModal';
import Icon from '../components/global/Icon';
import BreakerText from '../components/ui/BreakerText';
import { Colors, screenHeight, screenWidth, Shadows, BorderRadius, Spacing } from '../utils/Constants';
import LottieView from 'lottie-react-native';
import { goBack, navigate } from '../utils/NavigationUtil';
import dgram from 'react-native-udp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const deviceNames = [
  'Oppo', 
  'Vivo X1',
  'Samsung S56', 
  'iphone 16 pro',
  'OnePlus 9'
]

const SendScreen = () => {
  const { connectToServer, isConnected} = useTCP();

  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleScan = (data: any) => {
    console.log('handleScan', data)
    try {
      const [connectionData, deviceName] = data.replace('tcp://', '').split('|')
      const [host, port] = connectionData?.split(':')
      
      if (!host || !port || !deviceName) {
        Alert.alert('Invalid Device', 'The selected device has invalid connection data. Please try again.');
        return;
      }
      
      console.log('Connecting to:', host, port, deviceName);
      setIsConnecting(true);
      connectToServer(host, parseInt(port,10), deviceName)
    } catch (error) {
      console.error('Error parsing device data:', error);
      Alert.alert('Connection Error', 'Failed to parse device connection data. Please try again.');
      setIsConnecting(false);
    }
  }

  const handleGoBack = () => {
    goBack()
  }

  const getRandomPosition = (radius: number, existingPositions: {x: number, y: number}[], minDistance: number) => {
    let position: {x: number, y: number};
    let isOverlapping;

    do {
      const angle = Math.random() * 360;
      const distance = Math.random() * (radius - 50) + 50;
      const x = distance * Math.cos((angle + Math.PI) / 180);
      const y = distance * Math.sin((angle + Math.PI) / 180);

      position = {x, y};
      isOverlapping = existingPositions.some(pos => {
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      })
    } while (isOverlapping);

    return position;
  }

  const listenForDevices = async () => {
    const server = dgram.createSocket({
      type: 'udp4',
      reusePort: true
    })
    const port = 57143;
    server.bind(port, () => {
      console.log('Listening for devices on port', port)
    })

    server.on('message', (msg, rinfo) => {
      const [connectionData, otherDevice] = msg?.toString()?.replace('tcp://', '').split('|');

      setNearbyDevices((prevDevices) => {
        // Add your device processing logic here
        const deviceExists = prevDevices?.some(device => device?.name === otherDevice)
        if(!deviceExists) {
          const newDevice = {
            id: `${Date.now()}_${(Math.random())}`,
            name: otherDevice,
            image: require('../assets/icons/device.jpeg'),
            fullAddress: msg?.toString(),
            position: getRandomPosition(150, prevDevices?.map((d)=> d.position),50),
            scale: new Animated.Value(0)
          };

          Animated.timing(newDevice.scale, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }).start()
          return [...prevDevices, newDevice]
        }
        return prevDevices;
      })
    })
    
  }
  
  useEffect(()=>{
    if(isConnected) {
      setIsConnecting(false);
      navigate('Connection')
    }
  },[isConnected])

  // Reset connecting state if connection fails
  useEffect(() => {
    if (!isConnected && isConnecting) {
      // Add a timeout to reset connecting state if connection fails
      const timeout = setTimeout(() => {
        setIsConnecting(false);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isConnected, isConnecting]);

  useEffect(()=>{
    let udpServer: any;
    const setupServer = async () => {
      udpServer = await listenForDevices()
    }
    setupServer()
    return () => {
      if(udpServer) {
        udpServer.close(()=> {
          console.log('UDP server closed')
        })
      }
      setNearbyDevices([])
    }
  },[])

  // useEffect(()=> {
  //   const timer = setInterval(()=> {
  //     if(nearbyDevices.length < deviceNames.length) {
  //       const newDevice = {
  //         id: `${Date.now()}_${(Math.random())}`,
  //         name: deviceNames[nearbyDevices.length],
  //         image: require('../assets/icons/device.jpeg'),
  //         position: getRandomPosition(150, nearbyDevices?.map((d)=> d.position),50),
  //         scale: new Animated.Value(0)
  //       };

  //       setNearbyDevices((prevDevices)=> [...prevDevices, newDevice])

  //       Animated.timing(newDevice.scale, {
  //         toValue: 1,
  //         duration: 1500,
  //         easing: Easing.out(Easing.ease),
  //         useNativeDriver: true
  //       }).start()
  //     } else {
  //       clearInterval(timer)
  //     }
  //   }, 2000)

  //   return () => clearInterval(timer)
  // },[nearbyDevices])

  

  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2, Colors.secondary]}
        style={styles.gradientContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.mainContainer}>
          <View style={styles.infoContainer}>
            <View style={styles.iconWrapper}>
              <Icon
                name="paper-plane"
                size={48}
                color={Colors.surface}
                iconFamily="Ionicons"
              />
            </View>
            <Text style={styles.title}>Send to nearby devices</Text>
            <Text style={styles.subtitle}>Ensure device is connected to the sender's hotspot</Text>
            
            <BreakerText text="or" />

            <TouchableOpacity style={styles.qrButton} onPress={() => setIsScannerVisible(true)}>
              <Icon name="qrcode" size={20} color={Colors.primary} iconFamily="MaterialCommunityIcons" />
              <Text style={styles.qrButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.animationContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                style={styles.lottie}
                source={require('../assets/animations/scanner.json')}
                autoPlay
                loop
                hardwareAccelerationAndroid
              />
              {
                nearbyDevices.map((device) => (
                  <Animated.View
                    key={device.id}
                    style={[
                      styles.deviceDot,
                      {
                        transform: [{scale: device.scale}],
                        left: (screenWidth / 2) + device.position?.x - 17.5,
                        top: (screenWidth / 2) + device.position?.y - 17.5
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={[styles.devicePopup, isConnecting && { opacity: 0.5 }]} 
                      onPress={() => handleScan(device?.fullAddress)}
                      disabled={isConnecting}
                    >
                      <Image source={device.image} style={styles.deviceImage} />
                      <Text style={styles.deviceName}>{device.name}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              }
            </View>
            <View style={styles.profileContainer}>
              <Image source={require('../assets/images/profile.jpg')} style={styles.profileImage} />
            </View>
            
            {isConnecting && (
              <View style={styles.connectingOverlay}>
                <ActivityIndicator size="large" color={Colors.surface} />
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon 
              name="arrow-back" 
              size={20} 
              color={Colors.text} 
              iconFamily="Ionicons"
            />
          </TouchableOpacity>
        </View>

        {
          isScannerVisible && (
            <QRScannerModal
              visible={isScannerVisible}
              onClose={()=> setIsScannerVisible(false)}
            />
          )
        }
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
  },
  mainContainer: {
    flex: 1,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontFamily: 'Okra-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.surface,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.lg,
    fontFamily: 'Okra-Regular',
    lineHeight: 22,
  },
  qrButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  qrButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Okra-Medium',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  lottieContainer: {
    position: 'absolute',
    width: screenWidth,
    height: screenWidth,
    alignSelf: 'center',
    zIndex: 1,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  deviceDot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  devicePopup: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.sm,
    ...Shadows.medium,
    maxWidth: 120,
  },
  deviceImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: Spacing.xs,
  },
  deviceName: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Okra-Medium',
    textAlign: 'center',
  },
  profileContainer: {
    zIndex: 3,
    backgroundColor: Colors.surface,
    borderRadius: 35,
    padding: Spacing.xs,
    ...Shadows.large,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.medium,
    zIndex: 4,
  },
  connectingText: {
    color: Colors.surface,
    marginTop: Spacing.md,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Okra-Medium',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
    zIndex: 5,
  },
})

export default SendScreen