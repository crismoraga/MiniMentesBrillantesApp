// Home.js

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
  const [age, setAge] = useState(null);

  useEffect(() => {
    const fetchAge = async () => {
      try {
        const savedAge = await AsyncStorage.getItem('selectedAge');
        setAge(savedAge);
      } catch (error) {
        console.error('Error fetching age:', error);
        Alert.alert('Error', 'No se pudo cargar la edad seleccionada.');
      }
    };

    fetchAge();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('stayLoggedIn');
      await AsyncStorage.removeItem('selectedAge');
      navigation.replace('Login'); // Regresa a la pantalla de login
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a Mini Mentes Brillantes!</Text>
      {age && <Text style={styles.ageText}>Edad seleccionada: {age} años</Text>}
      <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Acceso a Juegos")}>
        <Text style={styles.buttonText}>Ir a Juegos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
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
  ageText: {
    fontSize: 20,
    marginBottom: 30,
    color: '#555',
  },
  button: {
    backgroundColor: '#6a5acd',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Home;
