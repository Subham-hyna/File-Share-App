import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import React, { useState, useCallback } from 'react'
import { commonStyles } from '../styles/CommonStyles'
import HomeHeader from '../components/home/HomeHeader'
import SendReceiveButton from '../components/home/SendReceiveButton'
import Options from '../components/home/Options'
import Misc from '../components/home/Misc'
import AbsoluteQRBottom from '../components/home/AbsoluteQRBottom'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing } from '../utils/Constants'
import LinearGradient from 'react-native-linear-gradient'

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  return (
    <View style={[commonStyles.baseContainer, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradientContainer}
      >
        <HomeHeader />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.content}>
            <SendReceiveButton />
            <Options isHome={true} onFilePickedUp={()=>{}} onMediaPickedUp={()=>{}} />
            <Misc />
          </View>
        </ScrollView>
        <AbsoluteQRBottom />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: Spacing.md,
  },
  content: {
    flex: 1,
    gap: Spacing.md,
  },
})

export default HomeScreen