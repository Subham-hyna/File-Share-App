import { View, Text, TouchableOpacity, Image, Platform, StyleSheet, StatusBar } from 'react-native'
import React, { FC, use, useEffect, useRef, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/global/Icon';
import BreakerText from '../components/ui/BreakerText';
import { Colors, Shadows, BorderRadius, Spacing } from '../utils/Constants';
import LottieView  from 'lottie-react-native';
import QRGenerateModal from '../components/modals/QRGenerateModal';
import DeviceInfo from 'react-native-device-info';
import { goBack, navigate } from '../utils/NavigationUtil';
import { useTCP } from '../service/TCPProvider';
import { getBroadcastIPAddress, getLocalIPAddress } from '../utils/networkUtils';
import dgram from 'react-native-udp';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
  
const ReceiveScreen:FC = () => {

  const { startServer, server, isConnected } = useTCP();
  const [qrValue, setQrValue] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress()
    const port = 4000;

    if(!server) {
      startServer(port);
    }

    setQrValue(`tcp://${ip}:${port}|${deviceName}`);
    console.log('Server info: ${ip}:${port}');
  }

  const sendDiscoverySignal = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const broadcastAddress = await getBroadcastIPAddress();
    const targetAddress = broadcastAddress || "255.255.255.255";
    const port = 57143;

    const client = dgram.createSocket({
      type: 'udp4',
      reusePort: true,
    })

    client.bind(() => {
      try {
        if(Platform.OS == 'ios') {
          client.setBroadcast(true);
        }

        client.send(`${qrValue}`, 0, `${qrValue}`.length, port, targetAddress, (err) => {
          if(err) {
            console.log('Error Discovery Signal', err);
          } else {
            console.log('Discovery signal sent to', targetAddress);
          }
          client.close();
        })
      } catch (error) {
        console.log('Error sending discovery signal', error);
        client.close();
      }
    })
  }

  useEffect(() => {
    if(!qrValue) return;

    sendDiscoverySignal();
    intervalRef.current = setInterval(() => {
      sendDiscoverySignal();
    }, 3000);

    return () => {
      if(intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  },[qrValue])

  const handleGoBack = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goBack();
  }

  useEffect(() => {
    if(isConnected) {
      if(intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      navigate("Connection")
    }
  }, [isConnected])

  useEffect(() => {
    setupServer();
  }, [])

  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[Colors.gradient3, Colors.gradient4, Colors.info]}
        style={styles.gradientContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.mainContainer}>
          <View style={styles.infoContainer}>
            <View style={styles.iconWrapper}>
              <Icon
                name="download"
                size={48}
                color={Colors.surface}
                iconFamily="Ionicons"
              />
            </View>
            <Text style={styles.title}>Receiving from nearby devices</Text>
            <Text style={styles.subtitle}>Ensure device is connected to the sender's hotspot</Text>
            
            <BreakerText text="or" />

            <TouchableOpacity style={styles.qrButton} onPress={() => setIsScannerVisible(true)}>
              <Icon name="qrcode" size={20} color={Colors.primary} iconFamily="MaterialCommunityIcons" />
              <Text style={styles.qrButtonText}>Show QR Code</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.animationContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                style={styles.lottie}
                source={require('../assets/animations/scan2.json')}
                autoPlay
                loop
                hardwareAccelerationAndroid
              />
            </View>
            <View style={styles.profileContainer}>
              <Image 
                source={require('../assets/images/profile.jpg')}
                style={styles.profileImage}
              />
            </View>
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
            <QRGenerateModal
              visible={isScannerVisible}
              onClose={() => setIsScannerVisible(false)}
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
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  profileContainer: {
    zIndex: 2,
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

export default ReceiveScreen