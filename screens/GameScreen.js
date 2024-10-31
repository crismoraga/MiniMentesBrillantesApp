import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ShapeSortingGame from './ShapeSortingGame';
import ShapeSortingGame2 from './ShapeSortingGame2';
import PizzaGame from './PizzaGame';

const GameScreen = ({ navigation }) => {
  return React.createElement(
    ScrollView,
    { contentContainerStyle: styles.container },
    React.createElement(ShapeSortingGame, { navigation: navigation }),
    React.createElement(ShapeSortingGame2, { navigation: navigation }),
    React.createElement(PizzaGame, { navigation: navigation })
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AEE1E1',
    padding: 20,
  },
});

export default GameScreen;
