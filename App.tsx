import React, { useEffect } from 'react'
import Navigation from './src/navigation/Navigation'
import { requestPhotoPermission } from './src/utils/Constants'
import { checkFilePermissions } from './src/utils/libraryHelpers'
import { Platform, StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const App = () => {

  useEffect(() => {
    requestPhotoPermission();
    checkFilePermissions(Platform.OS);
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      <Navigation />
    </SafeAreaProvider>
  )
}

export default App