import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

const shapes = [
  { id: 'circle', label: 'Círculo', sides: 1, color: '#FF5733', image: require('../assets/circle.png') },
  { id: 'square', label: 'Cuadrado', sides: 4, color: '#33FF57', image: require('../assets/square.png') },
  { id: 'triangle', label: 'Triángulo', sides: 3, color: '#FF33A1', image: require('../assets/triangle.png') },
  { id: 'star', label: 'Estrella', sides: 5, color: '#FFD700', image: require('../assets/star.png') },
  { id: 'hexagon', label: 'Hexágono', sides: 6, color: '#8A2BE2', image: require('../assets/hexagon.png') },
];

const shuffleArray = (array) => {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const ShapeSortingGame = ({ navigation }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isGamePhase, setIsGamePhase] = useState(false);
  const [isIdentificationPhase, setIsIdentificationPhase] = useState(false);
  const [randomShape, setRandomShape] = useState(shapes[0]);
  const [identifiedShapes, setIdentifiedShapes] = useState([]);
  const [remainingShapes, setRemainingShapes] = useState(shuffleArray(shapes));

  const showNextTutorialShape = () => {
    if (tutorialStep < remainingShapes.length - 1) {
      setTutorialStep(tutorialStep + 1);
      setRandomShape(remainingShapes[tutorialStep + 1]);
    } else {
      setIsGamePhase(true);
      setRemainingShapes(shuffleArray(shapes));
      setRandomShape(remainingShapes[0]);
    }
  };

  const handleAnswer = (shapeId) => {
    if (shapeId === randomShape.id) {
      setScore(score + 10);
      setIdentifiedShapes([...identifiedShapes, shapeId]);
      Alert.alert('¡Correcto!', `Has identificado el ${randomShape.label} correctamente.`);

      const newRemainingShapes = remainingShapes.filter(shape => shape.id !== shapeId);
      setRemainingShapes(newRemainingShapes);

      if (newRemainingShapes.length === 0) {
        Alert.alert('¡Felicidades!', 'Has identificado todas las figuras correctamente. Ahora elige la figura solicitada.');
        setIsGamePhase(false);
        setIsIdentificationPhase(true);
        setRemainingShapes(shuffleArray(shapes));
        setRandomShape(remainingShapes[0]);
      } else {
        setRandomShape(newRemainingShapes[Math.floor(Math.random() * newRemainingShapes.length)]);
      }
    } else {
      Alert.alert('Inténtalo de nuevo', 'Esa no es la figura correcta.');
    }
  };

  const handleIdentificationAnswer = (shapeId) => {
    if (shapeId === randomShape.id) {
      setScore(score + 20);
      setIdentifiedShapes([...identifiedShapes, shapeId]);

      const newRemainingShapes = remainingShapes.filter(shape => shape.id !== shapeId);
      setRemainingShapes(newRemainingShapes);

      if (newRemainingShapes.length === 0) {
        Alert.alert('¡Felicidades!', 'Has completado todas las fases del juego. ¡Gran trabajo!');
        navigation.navigate('MainGameScreen'); // Regresa a la pantalla de selección de juego
      } else {
        Alert.alert('¡Correcto!', `Has elegido la figura correcta: ${randomShape.label}.`);
        setRandomShape(newRemainingShapes[Math.floor(Math.random() * newRemainingShapes.length)]);
      }
    } else {
      Alert.alert('Inténtalo de nuevo', 'Esa no es la figura correcta.');
    }
  };

  const renderTutorial = () => (
    <View style={styles.container}>
      <Text style={styles.titleText}>Aprendamos las Figuras</Text>
      <Image source={randomShape.image} style={styles.shapeImage} />
      <Text style={styles.subtitleText}>{randomShape.label}</Text>
      <Text style={styles.shapeDescription}>Lados: {randomShape.sides}</Text>
      <TouchableOpacity style={styles.nextButton} onPress={showNextTutorialShape}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGame = () => (
    <View style={styles.container}>
      <Text style={styles.titleText}>¿Qué figura estás viendo?</Text>
      <Image source={randomShape.image} style={styles.shapeImage} />
      <View style={styles.optionsContainer}>
        {shapes.map((shape) => (
          <TouchableOpacity key={shape.id} style={[styles.optionButton, { backgroundColor: shape.color }]} onPress={() => handleAnswer(shape.id)}>
            <Text style={styles.optionText}>{shape.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderIdentificationPhase = () => (
    <View style={styles.container}>
      <Text style={styles.titleText}>Elige la figura: {randomShape.label}</Text>
      <View style={styles.optionsContainer}>
        {shapes.map((shape) => (
          <TouchableOpacity key={shape.id} onPress={() => handleIdentificationAnswer(shape.id)}>
            <View style={[styles.shapeContainer, { backgroundColor: shape.color }]}>
              <Image source={shape.image} style={styles.smallShapeImage} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isGamePhase && !isIdentificationPhase && renderTutorial()}
      {isGamePhase && !isIdentificationPhase && renderGame()}
      {isIdentificationPhase && renderIdentificationPhase()}
      <Text style={styles.score}>Puntuación: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AEE1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  shapeImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  smallShapeImage: {
    width: 100,
    height: 100,
  },
  shapeContainer: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  shapeDescription: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#6a5acd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    margin: 5,
    width: '40%',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default ShapeSortingGame;