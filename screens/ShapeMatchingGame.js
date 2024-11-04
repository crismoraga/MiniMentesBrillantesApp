import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import Svg, { Circle, Rect, Polygon, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ShapeMatchingGame = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState('4-5');
  const [shapes, setShapes] = useState([]);
  const [targetShapes, setTargetShapes] = useState([]);
  const [options, setOptions] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const fetchAge = async () => {
      const age = await AsyncStorage.getItem('selectedAge');
      setSelectedAge(age || '4-5');
      initializeGame(age || '4-5');
    };
    fetchAge();
  }, []);

  const initializeGame = (ageGroup) => {
    const baseShapes = [
      { 
        id: 'circle', 
        label: 'Círculo', 
        svg: (color) => (
          <Svg height="80%" width="80%" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" fill={color} />
          </Svg>
        )
      },
      { 
        id: 'square', 
        label: 'Cuadrado', 
        svg: (color) => (
          <Svg height="80%" width="80%" viewBox="0 0 100 100">
            <Rect x="10" y="10" width="80" height="80" fill={color} />
          </Svg>
        )
      },
      { 
        id: 'rectangle', 
        label: 'Rectángulo', 
        svg: (color) => (
          <Svg height="80%" width="80%" viewBox="0 0 100 100">
            <Rect x="5" y="25" width="90" height="50" fill={color} />
          </Svg>
        )
      },
    ];

    if (ageGroup === '5-6' || ageGroup === '6+') {
      baseShapes.push({ 
        id: 'star', 
        label: 'Estrella', 
        svg: (color) => (
          <Svg height="80%" width="80%" viewBox="0 0 100 100">
            <Path
              d="M50 10 L61 40 L93 40 L67 60 L77 90 L50 72 L23 90 L33 60 L7 40 L39 40 Z"
              fill={color}
            />
          </Svg>
        )
      });
      baseShapes.push({
        id: 'flower',
        label: 'Flor',
        svg: (color) => (
          <Svg height="80%" width="80%" viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="10" fill={color} />
            {[...Array(5)].map((_, i) => (
              <Circle
                key={i}
                cx={50 + 20 * Math.cos((i * 2 * Math.PI) / 5)}
                cy={50 + 20 * Math.sin((i * 2 * Math.PI) / 5)}
                r="10"
                fill={color}
              />
            ))}
          </Svg>
        )
      });
    }

    setShapes(baseShapes);
    generateGame(baseShapes);
  };

  const generateGame = (availableShapes) => {
    const targetShapes = availableShapes.slice(0, 3);
    setTargetShapes(targetShapes);
    const options = shuffleArray([...availableShapes]);
    setOptions(options);
  };

  const shuffleArray = (array) => {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleShapePress = (shapeId) => {
    const correct = targetShapes.some(shape => shape.id === shapeId);
    if (correct) {
      Alert.alert('¡Correcto!', 'Has seleccionado la figura correcta.');
    } else {
      Alert.alert('Inténtalo de nuevo', 'Esa no es la figura correcta.');
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  return (
    <View style={styles.container}>
      {showTutorial ? (
        <View style={styles.tutorialContainer}>
          <Text style={styles.tutorialTitle}>¿Cómo jugar?</Text>
          <Text style={styles.tutorialText}>
            Observa las figuras de arriba y selecciona las mismas figuras en la parte de abajo. ¡Diviértete aprendiendo!
          </Text>
          <TouchableOpacity style={styles.tutorialButton} onPress={handleTutorialClose}>
            <Text style={styles.tutorialButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Clasificación de Figuras</Text>
          <Text style={styles.instruction}>Selecciona las figuras que correspondan:</Text>
          <View style={styles.targetContainer}>
            {targetShapes.map((shape) => (
              <View key={shape.id} style={styles.shapeContainer}>
                {shape.svg('#FFC107')}
              </View>
            ))}
          </View>
          <View style={styles.optionsContainer}>
            {options.map((shape) => (
              <TouchableOpacity
                key={shape.id}
                style={styles.option}
                onPress={() => handleShapePress(shape.id)}
              >
                {shape.svg('#00695C')}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default ShapeMatchingGame;

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#E0F7FA',
    alignItems:'center',
    padding:20,
  },
  title: {
    fontSize:30,
    fontWeight:'bold',
    color:'#00695C',
    marginBottom:10,
  },
  instruction: {
    fontSize:18,
    color:'#004D40',
    marginBottom:20,
  },
  targetContainer: {
    flexDirection:'row',
    justifyContent:'center',
    marginBottom:20,
  },
  shapeContainer: {
    width:80,
    height:80,
    marginHorizontal:10,
  },
  optionsContainer: {
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'center',
  },
  option: {
    width:100,
    height:100,
    margin:10,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#FFF',
    borderRadius:10,
    elevation:5,
  },
  tutorialContainer: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
  },
  tutorialTitle: {
    fontSize:28,
    fontWeight:'bold',
    color:'#00695C',
    marginBottom:10,
  },
  tutorialText: {
    fontSize:18,
    color:'#004D40',
    textAlign:'center',
    marginBottom:20,
  },
  tutorialButton: {
    backgroundColor:'#00695C',
    padding:15,
    borderRadius:10,
  },
  tutorialButtonText: {
    color:'#FFF',
    fontSize:18,
  },
});
