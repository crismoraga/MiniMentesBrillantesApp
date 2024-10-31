// screens/LoginScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('stayLoggedIn');
      const savedAge = await AsyncStorage.getItem('selectedAge');
      if (isLoggedIn === 'true' && savedAge) {
        navigation.replace('MainGameScreen'); // Asegúrate de que el nombre aquí coincida
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    const predefinedUser = 'admin';
    const predefinedPassword = 'admin';

    if (username === predefinedUser && password === predefinedPassword) {
      if (stayLoggedIn) {
        await AsyncStorage.setItem('stayLoggedIn', 'true');
      } else {
        await AsyncStorage.removeItem('stayLoggedIn');
      }
      navigation.navigate('AgeSelection');
    } else {
      Alert.alert('Error', 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.checkboxContainer}>
        <Switch
          value={stayLoggedIn}
          onValueChange={setStayLoggedIn}
          style={styles.checkbox}
        />
        <Text style={styles.checkboxLabel}>Mantenerme logueado</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar</Text>
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
  input: {
    height: 50,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#6a5acd',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default LoginScreen;
