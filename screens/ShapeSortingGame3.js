import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Animated, Dimensions, ImageBackground } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { PanResponder } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const shapes = [
  { id: 1, type: 'star', image: require('../assets/star.png') },
  { id: 2, type: 'heart', image: require('../assets/heart.png') },
];

const ShapeSortingGame3 = ({ ageGroup }) => {
  const [shapes, setShapes] = useState(() => generateShapes(ageGroup));
  const [sortedShapes, setSortedShapes] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleShapePress = useCallback(async (shape) => {
    if (isAnimating) return;
    
    try {
      setIsAnimating(true);
      setSortedShapes(prev => [...prev, shape]);
      setShapes(prev => prev.filter(s => s.id !== shape.id));
      
      if (shapes.length === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        Alert.alert('¡Felicidades!', '¡Has clasificado todas las figuras!',
          [{ text: 'OK', onPress: () => setIsAnimating(false) }]
        );
      } else {
        setIsAnimating(false);
      }
    } catch (error) {
      console.error('Error handling shape:', error);
      setIsAnimating(false);
    }
  }, [shapes.length, isAnimating]);

  const generateShapes = (ageGroup) => {
    const baseShapes = [
      { id: 'circle', type: 'circle', color: '#FF5733' },
      { id: 'square', type: 'square', color: '#33FF57' },
      { id: 'triangle', type: 'triangle', color: '#FF33A1' },
    ];
    if (ageGroup === '5-6') {
      baseShapes.push({ id: 'star', type: 'star', color: '#FFD700' });
    }
    return baseShapes;
  };

  const renderShape = (shape) => {
    switch (shape.type) {
      case 'circle':
        return <Circle cx="50" cy="50" r="40" fill={shape.color} />;
      case 'square':
        return <Rect x="10" y="10" width="80" height="80" fill={shape.color} />;
      case 'triangle':
        return <Polygon points="50,15 90,85 10,85" fill={shape.color} />;
      case 'star':
        return (
          <Polygon
            points="50,15 61,35 82,35 67,50 74,70 50,57 26,70 33,50 18,35 39,35"
            fill={shape.color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clasifica las Figuras</Text>
      <View style={styles.shapesContainer}>
        {shapes.map((shape) => (
          <TouchableOpacity key={shape.id} style={styles.shape} onPress={() => handleShapePress(shape)}>
            <Svg height="100" width="100">{renderShape(shape)}</Svg>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sortedText}>Figuras Clasificadas: {sortedShapes.length}</Text>
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
  shapesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  shape: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
    margin: 10,
  },
  sortedText: {
    fontSize: 20,
    color: '#333',
    marginTop: 20,
  },
});

export default ShapeSortingGame3;
