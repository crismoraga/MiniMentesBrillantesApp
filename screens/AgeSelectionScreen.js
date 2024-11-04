import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

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
      <Animatable.Text animation="fadeInDown" style={styles.title}>
        Selecciona la edad del niño
      </Animatable.Text>
      <Animatable.View animation="pulse" iterationCount="infinite" easing="ease-out">
        <TouchableOpacity style={styles.button} onPress={() => handleAgeSelect('4-5')}>
          <Text style={styles.buttonText}>4 a 5 años</Text>
        </TouchableOpacity>
      </Animatable.View>
      <Animatable.View animation="pulse" iterationCount="infinite" easing="ease-out" delay={500}>
        <TouchableOpacity style={styles.button} onPress={() => handleAgeSelect('6+')}>
          <Text style={styles.buttonText}>6 o más</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE082',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#BF360C',
  },
  button: {
    backgroundColor: '#FF6F00',
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
