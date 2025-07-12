import React, { FC } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import HomeScreen from '../screens/HomeScreen'
import SendScreen from '../screens/SendScreen'
import SplashScreen from '../screens/SplashScreen'
import { navigationRef } from '../utils/NavigationUtil'
import ConnectionScreen from '../screens/ConnectionScreen'
import ReceiveScreen from '../screens/ReceiveScreen'
import ReceivedFileScreen from '../screens/ReceivedFileScreen'
import { TCPProvider } from '../service/TCPProvider'

const Stack = createNativeStackNavigator()

const Navigation:FC = () => {
  return (
    <TCPProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Send" component={SendScreen} />
          <Stack.Screen name="Connection" component={ConnectionScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="ReceivedFile" component={ReceivedFileScreen} />
        </Stack.Navigator>
      </NavigationContainer>  
    </TCPProvider>
  )
}

export default Navigation