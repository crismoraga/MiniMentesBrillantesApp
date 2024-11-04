import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';

const CountingShapesGame = ({ ageGroup }) => {
  const [currentShape, setCurrentShape] = useState('circle');
  const [count, setCount] = useState(0);
  const maxCount = ageGroup === '4-5' ? 10 : 20;

  const shapes = {
    circle: (color) => <Circle cx="50" cy="50" r="40" fill={color} />,
    square: (color) => <Rect x="10" y="10" width="80" height="80" fill={color} />,
    triangle: (color) => (
      <Polygon points="50,15 90,85 10,85" fill={color} />
    ),
  };

  const handleShapePress = () => {
    setCount(count + 1);
    if (count + 1 >= maxCount) {
      Alert.alert('¡Felicidades!', `Has contado ${maxCount} ${currentShape}s.`);
      setCount(0);
      setCurrentShape(currentShape === 'circle' ? 'square' : 'circle');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuenta las {currentShape}s</Text>
      <TouchableOpacity style={styles.shapeContainer} onPress={handleShapePress}>
        <Svg height="100" width="100">{shapes[currentShape]('#FF5733')}</Svg>
      </TouchableOpacity>
      <Text style={styles.countText}>Contador: {count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#006064',
  },
  shapeContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  countText: {
    fontSize: 20,
    color: '#333',
  },
});

export default CountingShapesGame;
