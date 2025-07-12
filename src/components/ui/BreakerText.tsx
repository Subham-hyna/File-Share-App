import { View, Text, StyleSheet } from 'react-native'
import React, { FC } from 'react'

const BreakerText:FC<{text: string}> = ({text}) => {


  return (
    <View style={styles.breakerContainer}>
      <View style={styles.horizontalLine} />    
      <Text style={styles.breakerText}>{text}</Text>
      <View style={styles.horizontalLine} />
    </View>
  )
}

const styles = StyleSheet.create({
  breakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 20,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  breakerText: {
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
    opacity: 0.8,
    fontSize: 12,
    fontFamily: 'okra-Medium',
  },
})

export default BreakerText