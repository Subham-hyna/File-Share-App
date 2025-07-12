import { View, Text, Modal, Animated, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import { modalStyles } from '../../styles/modalStyles';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { multiColor } from '../../utils/Constants';
import Icon from '../global/Icon';
import { useTCP } from '../../service/TCPProvider';
import DeviceInfo from 'react-native-device-info';
import { getLocalIPAddress } from '../../utils/networkUtils';
import { navigate } from '../../utils/NavigationUtil';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
}

const QRGenerateModal:FC<ModalProps> = ({visible, onClose}) => {
    const { isConnected, server, startServer } = useTCP();

    const [loading, setLoading] = useState(false);
    const [qrValue, setQrValue] = useState('Subham');
    const shimmerTranslateX = useSharedValue(-300);

    const setupServer = async () => {
        const deviceName = await DeviceInfo.getDeviceName();
        const ip = await getLocalIPAddress()
        const port = 4000;
    
        if(server) {
            setQrValue(`tcp://${ip}:${port}|${deviceName}`);
            setLoading(false);
            return;
        }

        startServer(port);
        setQrValue(`tcp://${ip}:${port}|${deviceName}`);
        console.log(`Server info: ${ip}:${port}`);
        setLoading(false);
    }

    const shimmerStyle = useAnimatedStyle(()=>({
        transform: [{translateX: shimmerTranslateX.value}]
    }))

    useEffect(() => {
        shimmerTranslateX.value = withRepeat(
            withTiming(300, {duration: 1500, easing: Easing.linear}),
            -1,
            false
        )

        if(visible) {
            setLoading(true);
            setupServer();
        }
    },[visible])

    useEffect(() => {
        console.log('TCPProvider', isConnected)
        if(isConnected) {
            onClose();
            navigate('Connection')
        }
    },[isConnected])

  return (
    <Modal 
    visible={visible} 
    animationType='slide'
    presentationStyle='formSheet'
    onRequestClose={onClose}
    onDismiss={onClose}
    >
        <View style={modalStyles.modalContainer}>
            <View style={modalStyles.qrContainer}>
                {
                    loading || qrValue === null || qrValue === '' ? (
                        <View style={modalStyles.skeleton}> 
                            <Animated.View style={[modalStyles.shimmerOverlay, shimmerStyle]}>
                                <LinearGradient 
                                    colors={['#f3f3f3', '#fff', '#f3f3f3']}
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}
                                    style={modalStyles.shimmerGradient}
                                />
                            </Animated.View>
                        </View>
                    ) : (
                        <QRCode 
                            value={qrValue}
                            size={250}
                            logoSize={60}
                            logoBackgroundColor='#fff'
                            logoMargin={2}
                            logoBorderRadius={10}
                            logo={require('../../assets/images/profile2.jpg')}
                            linearGradient={multiColor}
                            enableLinearGradient
                        />
                    )
                }
            </View>
            <View style={modalStyles.info}>
                <Text style={modalStyles.infoText1}>
                    Ensure you're on the same WI-Fi Network
                </Text>
                <Text style={modalStyles.infoText2}>
                    Scan the QR code to connect to the device
                </Text>
            </View>

            <ActivityIndicator 
                size="small"
                color="#000"
                style={{alignSelf: 'center'}}
            />

            <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={onClose}
            >
                <Icon 
                name='close'
                iconFamily='Ionicons'
                size={24}
                color='#000'
                />
            </TouchableOpacity>
        </View>
    </Modal>
  )
}

export default QRGenerateModal