import React, {useState} from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { firebase } from '../config';


const SettingsScreen = () => {
  const navigation = useNavigation();

  const [pressed, setPressed] = useState(false);
  const [pressedFaq, setPressedFaq] = useState(false);
  const [pressedAdd, setPressedAdd] = useState(false);

  const handlePressFaqIn = () => {
    setPressedFaq(true);
  };

  const handlePressFaqOut = () => {
    setPressedFaq(false);
  };
  const handlePressIn = () => {
    setPressed(true);
  };

  const handlePressOut = () => {
    setPressed(false);
  };
  const handlePressAddIn = () => {
    setPressedAdd(true);
  };

  const handlePressAddOut = () => {
    setPressedAdd(false);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#D2E9E9', position: 'relative', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, padding: 10 }}>
      <View >
      </View>
      <View>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Settings</Text>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: pressedFaq ? '#32AFA9' : 'transparent' }]}
          onPress={() => navigation.navigate('FAQ')}
          onPressIn={handlePressFaqIn}
          onPressOut={handlePressFaqOut}

        >
          <Text style={{ fontSize: 16 }}>F.A.Q</Text>
          
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: pressed ? '#32AFA9' : 'transparent' }]}
          onPress={() => navigation.navigate('About')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}

        >
          <Text style={{ fontSize: 16 }}>About</Text>
          
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: pressedAdd ? '#32AFA9' : 'transparent' }]}
          onPress={() => navigation.navigate('AddScreen')}
          onPressIn={handlePressAddIn}
          onPressOut={handlePressAddOut}

          
        >
          <Text style={{ fontSize: 16 }}>Add Tourist Spot</Text>
          
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => firebase.auth().signOut()}
        >
          <Text style={{ fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#32AFA9',
    elevation: 3, // for Android shadow
    shadowRadius: 2,
    marginVertical: 10,
  },
});

export default SettingsScreen;
