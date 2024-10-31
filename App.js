// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import MainGameScreen from './screens/MainGameScreen';
import ShapeSortingGame from './screens/ShapeSortingGame';
import ShapeSortingGame2 from './screens/ShapeSortingGame2';
import PizzaGame from './screens/PizzaGame';

const Stack = createStackNavigator();

LogBox.ignoreLogs([
  /Direct call to eval()/,
  /the variable .* was not declared/,
]);

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AgeSelection"
                    component={AgeSelectionScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="MainGameScreen" component={MainGameScreen} />
                <Stack.Screen name="ShapeSortingGame" component={ShapeSortingGame} />
                <Stack.Screen name="ShapeSortingGame2" component={ShapeSortingGame2} />
                <Stack.Screen name="PizzaGame" component={PizzaGame} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
