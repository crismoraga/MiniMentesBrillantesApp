// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './context/AppContext';
import { Audio } from 'expo-av';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import MainGameScreen from './screens/MainGameScreen';
import ShapeSortingGame from './screens/ShapeSortingGame';
import ShapeSortingGame2 from './screens/ShapeSortingGame2';
import ShapeSortingGame3 from './screens/ShapeSortingGame3';
import PizzaGame from './screens/PizzaGame';
import NumberTracingGame from './screens/NumberTracingGame';
import CountingShapesGame from './screens/CountingShapesGame';
import ShapeMatchingGame from './screens/ShapeMatchingGame';
import BeeCountingGame from './screens/BeeCountingGame';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('Error setting up audio:', error);
      }
    };

    setupAudio();
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AgeSelectionScreen" component={AgeSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainGameScreen" component={MainGameScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeSortingGame" component={ShapeSortingGame} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeSortingGame2" component={ShapeSortingGame2} options={{ headerShown: false }} />
          <Stack.Screen name="PizzaGame" component={PizzaGame} options={{ headerShown: false }} />
          <Stack.Screen name="NumberTracingGame" component={NumberTracingGame} options={{ headerShown: false }} />
          <Stack.Screen name="CountingShapesGame" component={CountingShapesGame} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeSortingGame3" component={ShapeSortingGame3} options={{ headerShown: false }} />
          <Stack.Screen name="ShapeMatchingGame" component={ShapeMatchingGame} options={{ headerShown: false }} />
          <Stack.Screen name="BeeCountingGame" component={BeeCountingGame} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
