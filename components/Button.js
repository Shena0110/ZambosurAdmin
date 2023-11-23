import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Awesome from 'react-native-vector-icons/FontAwesome';

const Button2 = ({ text, onPress, name }) => {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 2, paddingHorizontal: 8, marginBottom: -28 }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: 300,
          height: 50,
          justifyContent: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 20,
          borderWidth: 1,
          backgroundColor: 'slategray',
        }}
      >
        <Awesome name={name} size={24} color="black" />
        <Text style={{ fontSize: 18 }}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Button2;
