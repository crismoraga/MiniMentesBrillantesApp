import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Animatable from 'react-native-animatable';
import { LinearProgress } from '@rneui/themed';
import Svg, { Circle, Rect, Polygon, Path } from 'react-native-svg';
import { playSound } from '../utils/soundEffects';

const { width } = Dimensions.get('window');

const ShapeSortingGame = ({ navigation }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isGamePhase, setIsGamePhase] = useState(false);
  const [isIdentificationPhase, setIsIdentificationPhase] = useState(false);
  const [selectedAge, setSelectedAge] = useState('4-5');
  const [shapes, setShapes] = useState([]);
  const [remainingShapes, setRemainingShapes] = useState([]);
  const [randomShape, setRandomShape] = useState(null);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [identifiedShapes, setIdentifiedShapes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalShapes, setTotalShapes] = useState(0);
  const confettiRef = useRef(null);
  const animation = useRef(null);

  useEffect(() => {
    const fetchSelectedAge = async () => {
      const age = await AsyncStorage.getItem('selectedAge');
      setSelectedAge(age || '4-5');

      const baseShapes = [
        { 
          id: 'circle', 
          label: 'Círculo', 
          sides: 1, 
          color: '#FF5733',
          icon: 'circle-outline',
          svg: (size, color) => (
            <Svg height={size} width={size} viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
            </Svg>
          )
        },
        { 
          id: 'square', 
          label: 'Cuadrado', 
          sides: 4, 
          color: '#33FF57',
          icon: 'square-outline',
          svg: (size, color) => (
            <Svg height={size} width={size} viewBox="0 0 100 100">
              <Rect x="10" y="10" width="80" height="80" stroke={color} strokeWidth="5" fill="none" />
            </Svg>
          )
        },
        { 
          id: 'triangle', 
          label: 'Triángulo', 
          sides: 3, 
          color: '#FF33A1',
          icon: 'triangle-outline',
          svg: (size, color) => (
            <Svg height={size} width={size} viewBox="0 0 100 100">
              <Polygon
                points="50,10 90,90 10,90"
                stroke={color}
                strokeWidth="5"
                fill="none"
              />
            </Svg>
          )
        },
      ];

      // Add star only for older kids (6+)
      if (age === '6+') {
        baseShapes.push({ 
          id: 'star', 
          label: 'Estrella', 
          sides: 5, 
          color: '#FFD700',
          icon: 'star-outline',
          svg: (size, color) => (
            <Svg height={size} width={size} viewBox="0 0 100 100">
              <Path
                d="M50,10 L61,40 L93,40 L67,60 L77,90 L50,72 L23,90 L33,60 L7,40 L39,40 Z"
                stroke={color}
                strokeWidth="5"
                fill="none"
              />
            </Svg>
          )
        });
      }

      setShapes(baseShapes);
      setTotalShapes(baseShapes.length);
      const shuffled = shuffleArray(baseShapes);
      setRemainingShapes(shuffled);
      setRandomShape(shuffled[0]);
    };

    fetchSelectedAge();
  }, []);

  useEffect(() => {
    if (remainingShapes.length > 0) {
      setRandomShape(remainingShapes[0]);
    } else {
      setRandomShape(null);
    }
  }, [remainingShapes]);

  useEffect(() => {
    setProgress((totalShapes - remainingShapes.length) / totalShapes);
  }, [remainingShapes, totalShapes]);

  const shuffleArray = (array) => {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const showNextTutorialShape = () => {
    if (tutorialStep < remainingShapes.length - 1) {
      setTutorialStep(tutorialStep + 1);
      setRandomShape(remainingShapes[tutorialStep + 1]);
    } else {
      setIsGamePhase(true);
      const shuffledShapes = shuffleArray(shapes);
      setRemainingShapes(shuffledShapes);
      if (shuffledShapes.length > 0) {
        setRandomShape(shuffledShapes[0]);
      }
    }
  };

  const animateCorrectAnswer = () => {
    if (confettiRef.current) {
      setConfettiVisible(true);
      confettiRef.current.start();
      setTimeout(() => {
        setConfettiVisible(false);
      }, 2000);
    }
  };

  const handleAnswer = async (shapeId) => {
    if (!randomShape) return;
    
    if (shapeId === randomShape.id) {
      await playSound('correct');
      setScore(score + 10);
      setIdentifiedShapes([...identifiedShapes, shapeId]);
      Alert.alert('¡Correcto!', `Has identificado el ${randomShape.label} correctamente.`);
      animateCorrectAnswer();

      const newRemainingShapes = remainingShapes.filter(shape => shape.id !== shapeId);
      setRemainingShapes(newRemainingShapes);

      if (newRemainingShapes.length === 0) {
        Alert.alert('¡Felicidades!', 'Has identificado todas las figuras correctamente. Ahora elige la figura solicitada.');
        setIsGamePhase(false);
        setIsIdentificationPhase(true);
        const shuffledShapes = shuffleArray(shapes);
        setRemainingShapes(shuffledShapes);
        setRandomShape(shuffledShapes.length > 0 ? shuffledShapes[0] : null);
      } else {
        const randomIndex = Math.floor(Math.random() * newRemainingShapes.length);
        setRandomShape(newRemainingShapes[randomIndex]);
      }
    } else {
      await playSound('wrong');
      setScore(Math.max(0, score - 5)); // Penalize wrong answers but don't go below 0
      Alert.alert('Inténtalo de nuevo', 'Esa no es la figura correcta.');
    }
  };

  const handleIdentificationAnswer = async (shapeId) => {
    if (shapeId === randomShape.id) {
      await playSound('correct');
      setScore(score + 20);
      
      const newRemainingShapes = remainingShapes.filter(shape => shape.id !== shapeId);
      setRemainingShapes(newRemainingShapes);

      if (newRemainingShapes.length === 0) {
        await playSound('complete');
        Alert.alert('¡Felicidades! 🎉', 
          `Has completado el juego con ${score + 20} puntos.\n\n¡Excelente trabajo!`,
          [{ 
            text: 'Volver a juegos', 
            onPress: () => navigation.navigate('MainGameScreen') 
          }]
        );
      } else {
        Alert.alert('¡Correcto! ✨', `Has encontrado el ${randomShape.label} correctamente.`);
        setRandomShape(newRemainingShapes[Math.floor(Math.random() * newRemainingShapes.length)]);
      }
    } else {
      await playSound('wrong');
      setScore(Math.max(0, score - 5));
      Alert.alert('Inténtalo de nuevo 🤔', 
        `Esa no es la figura correcta.\nBusca el ${randomShape.label}.`
      );
    }
  };

  const renderShape = (shape, size = 150) => (
    <Animatable.View 
      ref={animation}
      animation="pulse" 
      iterationCount="infinite" 
      easing="ease-out"
      duration={2000}
      style={[
        styles.shapeContainer,
        { transform: [{ scale: 1.2 }] } // Make shapes bigger for better visibility
      ]}
    >
      {shape.svg(size, shape.color)}
    </Animatable.View>
  );

  const renderGameCard = (shape) => (
    <TouchableOpacity
      key={shape.id}
      style={[styles.card, { backgroundColor: shape.color + '20' }]}
      onPress={() => handleAnswer(shape.id)}
    >
      <Animatable.View 
        animation="bounceIn" 
        duration={1000}
        style={styles.cardContent}
      >
        {renderShape(shape, 80)}
        <Text style={styles.cardText}>{shape.label}</Text>
      </Animatable.View>
    </TouchableOpacity>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <LinearProgress
        value={progress}
        variant="determinate"
        style={styles.progressBar}
        color={progress === 1 ? "#4CAF50" : "#2196F3"}
      />
      <Text style={styles.progressText}>
        {Math.round(progress * 100)}% Completado
      </Text>
    </View>
  );

  const renderTutorial = () => {
    if (!randomShape) return null;
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Aprendamos las Figuras</Text>
        {renderShape(randomShape)}
        <Text style={styles.subtitleText}>{randomShape.label}</Text>
        <Text style={styles.shapeDescription}>Lados: {randomShape.sides}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={showNextTutorialShape}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGame = () => {
    if (!randomShape) return null;
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>¿Qué figura estás viendo?</Text>
        {renderProgressBar()}
        {renderShape(randomShape)}
        <View style={styles.cardsContainer}>
          {shapes.map(shape => renderGameCard(shape))}
        </View>
        {confettiVisible && (
          <ConfettiCannon
            ref={confettiRef}
            count={50}
            origin={{x: width/2, y: -10}}
            autoStart={false}
            fadeOut={true}
          />
        )}
      </View>
    );
  };

  const renderIdentificationPhase = () => {
    if (!randomShape) return null;
    
    const shapesPerRow = 2;
    const buttonSize = Math.min(width * 0.4, (width - 60) / shapesPerRow);
  
    return (
      <View style={styles.container}>
        <View style={styles.questionContainer}>
          <Text style={styles.titleText}>Encuentra el:</Text>
          <Text style={styles.shapeName}>{randomShape.label}</Text>
        </View>
        
        <View style={styles.optionsGrid}>
          {shuffleArray([...shapes]).map((shape) => (
            <TouchableOpacity 
              key={shape.id} 
              onPress={() => handleIdentificationAnswer(shape.id)}
              style={[styles.optionButton, { width: buttonSize, height: buttonSize }]}
            >
              <View style={[styles.shapeOption, { backgroundColor: shape.color + '20' }]}>
                {shape.svg(buttonSize * 0.6, shape.color)}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {renderProgressBar()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.score}>Puntuación: {score}</Text>
      </View>
      {!isGamePhase && !isIdentificationPhase && renderTutorial()}
      {isGamePhase && !isIdentificationPhase && renderGame()}
      {isIdentificationPhase && renderIdentificationPhase()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1E6',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  titleText: {
    fontSize: 32, // Slightly smaller for better readability
    fontWeight: 'bold',
    color: '#4A4A4A', // Darker color for better contrast
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 28,
    color: '#9F86C0',
    textAlign: 'center',
    marginBottom: 10,
  },
  shapeIcon: {
    marginBottom: 20,
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
    paddingVertical: 20,
    gap: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  card: {
    width: width * 0.4,
    aspectRatio: 1,
    borderRadius: 15,
    padding: 10,
    margin: 5,
    elevation: 5, // Increase shadow for better depth perception
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#FFFFFF', // White background for better contrast
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  optionButton: {
    width: width * 0.4,
    aspectRatio: 1,
  },
  shapeOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  score: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  shapeContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  questionContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 24,
    color: '#4A4A4A',
    marginBottom: 5,
  },
  shapeName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6a5acd',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginVertical: 10,
  },
  optionsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    maxHeight: '70%',
  },
});

export default ShapeSortingGame;