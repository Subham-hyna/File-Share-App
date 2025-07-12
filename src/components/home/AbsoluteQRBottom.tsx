import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { bottomTabStyles } from '../../styles/bottomTabStyle'
import { navigate } from '../../utils/NavigationUtil'
import Icon from '../global/Icon'
import { Colors } from '../../utils/Constants'
import QRScannerModal from '../modals/QRScannerModal'

const AbsoluteQRBottom = () => {
    const [isVisible, setIsVisible] = useState(false)
    
    const handleScan = (data: string) => {
        console.log('Scanned QR Code:', data)
        // Handle the scanned data here
        // You can parse the data, navigate to another screen, etc.
    }


  return (
    <>
     <View style={bottomTabStyles.container}>
        <TouchableOpacity
            onPress={()=> navigate('ReceivedFile')}
        >
            <Icon
            name='apps-sharp'
            size={20}
            color={'#333'}
            iconFamily="Ionicons"
            />
        </TouchableOpacity>
        <TouchableOpacity
            style={bottomTabStyles.qrCode}
            onPress={()=> setIsVisible(true)}
        >
            <Icon
            name='qrcode-scan'
            size={26}
            color={'#fff'}
            iconFamily="MaterialCommunityIcons"
            />
        </TouchableOpacity>
        <TouchableOpacity
        >
            <Icon
            name='beer-sharp'
            size={26}
            color={'#333'}
            iconFamily="Ionicons"
            />
        </TouchableOpacity>
     </View>
     {isVisible && <QRScannerModal visible={isVisible} onClose={()=> setIsVisible(false)} onScan={handleScan} />}
    </>
  )
}

export default AbsoluteQRBottom