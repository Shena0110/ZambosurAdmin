import { View, Text, Platform, StatusBar} from 'react-native'
import React from 'react'

const FAQ = () => {
  return (
    <View style={{paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,}}>
      <Text>FAQ</Text>
    </View>
  )
}

export default FAQ;