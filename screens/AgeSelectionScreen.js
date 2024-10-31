import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AgeSelectionScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAgeSelection = async () => {
      const savedAge = await AsyncStorage.getItem('selectedAge');
      if (savedAge) {
        navigation.replace('MainGameScreen');
      }
    };

    checkAgeSelection();
  }, []);

  const handleAgeSelect = async (age) => {
    await AsyncStorage.setItem('selectedAge', age);
    navigation.replace('MainGameScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona la edad del niño</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleAgeSelect('4-5')}>
        <Text style={styles.buttonText}>4 a 5 años</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleAgeSelect('6+')}>
        <Text style={styles.buttonText}>6 o más</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#6a5acd',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AgeSelectionScreen;
