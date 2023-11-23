import { View, Text, Platform, StatusBar } from 'react-native'
import React from 'react'

const About = () => {
  return (
    <View style={{paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,}}>
      <Text>About</Text>
    </View>
  )
}

export default About;