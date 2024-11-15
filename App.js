// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './context/AppContext';
import { Audio } from 'expo-av';
import Toast, { BaseToast } from 'react-native-toast-message';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import MainGameScreen from './screens/MainGameScreen';
import ShapeSortingGame from './screens/ShapeSortingGame';
import PizzaGame from './screens/PizzaGame';
import NumberTracingGame from './screens/NumberTracingGame';
import CountingShapesGame from './screens/CountingShapesGame';
import ShapeMatchingGame from './screens/ShapeMatchingGame';
import BeeCountingGame from './screens/BeeCountingGame';
import SettingsScreen from './screens/SettingsScreen';
import MemorizeShapes from './screens/MemorizeShapes';

const Stack = createStackNavigator();

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FF5252' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
};

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AgeSelectionScreen" component={AgeSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainGameScreen" component={MainGameScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeSortingGame" component={ShapeSortingGame} options={{ headerShown: false }} />
          <Stack.Screen name="PizzaGame" component={PizzaGame} options={{ headerShown: false }} />
          <Stack.Screen name="NumberTracingGame" component={NumberTracingGame} options={{ headerShown: false }} />
          <Stack.Screen name="CountingShapesGame" component={CountingShapesGame} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeMatchingGame" component={ShapeMatchingGame} options={{ headerShown: false }} />
          <Stack.Screen name="BeeCountingGame" component={BeeCountingGame} options={{ headerShown: false }} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MemorizeShapes" component={MemorizeShapes} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </AppProvider>
  );
};

export default App;
