import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const numbers = [
  { id: 1, icon: 'numeric-1' },
  { id: 2, icon: 'numeric-2' },
  { id: 3, icon: 'numeric-3' },
  { id: 4, icon: 'numeric-4' },
  { id: 5, icon: 'numeric-5' },
  { id: 6, icon: 'numeric-6' },
  { id: 7, icon: 'numeric-7' },
  { id: 8, icon: 'numeric-8' },
  { id: 9, icon: 'numeric-9' },
  { id: 10, icon: 'numeric-10' },
];

const distractions = [
  { id: 'circle', icon: 'circle-outline' },
  { id: 'square', icon: 'square-outline' },
  { id: 'triangle', icon: 'triangle-outline' },
];

const levels = [
  { 
    id: 1, 
    background: 'forest', 
    numbers: [1, 2, 3],
    timeLimit: 30,
    pointsPerHit: 10
  },
  { 
    id: 2, 
    background: 'beach', 
    numbers: [4, 5, 6],
    timeLimit: 25,
    pointsPerHit: 20
  },
  { 
    id: 3, 
    background: 'mountain', 
    numbers: [7, 8, 9, 10],
    timeLimit: 20,
    pointsPerHit: 30
  },
];

const Game = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levels[0].timeLimit);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!showTutorial && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showTutorial, gameOver]);

  const playSound = async (type) => {
    let soundFile;
    if (type === 'correct') {
      soundFile = require('../assets/correct.mp3');
    } else if (type === 'incorrect') {
      soundFile = require('../assets/incorrect.mp3');
    }

    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  const playHaptic = async (type) => {
    try {
      if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.warn('Haptic feedback no disponible:', error);
    }
  };

  const handleNumberPress = async (number) => {
    if (number === currentNumber) {
      await playSound('correct');
      await playHaptic('success');
      nextNumber();
    } else {
      await playSound('incorrect');
      await playHaptic('error');
      setScore(Math.max(0, score - 5));
    }
  };

  const nextNumber = () => {
    const levelNumbers = levels[currentLevel].numbers;
    const nextIndex = levelNumbers.indexOf(currentNumber) + 1;
    if (nextIndex < levelNumbers.length) {
      setCurrentNumber(levelNumbers[nextIndex]);
    } else {
      if (currentLevel < levels.length - 1) {
        setCurrentLevel(currentLevel + 1);
        setCurrentNumber(levels[currentLevel + 1].numbers[0]);
      } else {
        setCurrentLevel(0);
        setCurrentNumber(levels[0].numbers[0]);
        alert('¡Felicidades! Has completado todos los niveles.');
      }
    }
    setScore(score + 1);
    playSound('correct');
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const startGame = () => {
    setShowTutorial(false);
    playSound('correct');
  };

  const renderIcons = () => {
    const currentLevelData = levels[currentLevel];
    const icons = [...currentLevelData.numbers, ...distractions.map(d => d.id)];
    icons.sort(() => Math.random() - 0.5);
    
    return icons.map((icon, index) => (
      <Animated.View
        key={index}
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: icon === currentNumber ? bounceAnim : 1 }]
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => handleNumberPress(icon)}
          style={styles.iconButton}
        >
          <Icon 
            name={icon.icon || `numeric-${icon}`} 
            type="material-community" 
            size={80} 
            color="#000" 
          />
        </TouchableOpacity>
      </Animated.View>
    ));
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>¡Juego Terminado!</Text>
        <Text style={styles.scoreText}>Puntuación Final: {score}</Text>
        <TouchableOpacity 
          style={styles.restartButton}
          onPress={() => {
            setGameOver(false);
            setScore(0);
            setCurrentLevel(0);
            setCurrentNumber(1);
            setTimeLeft(levels[0].timeLimit);
          }}
        >
          <Text style={styles.restartButtonText}>Jugar de Nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aventura Numérica</Text>
      {showTutorial ? (
        <View style={styles.tutorial}>
          <Text style={styles.tutorialText}>¡Bienvenido al juego de los números!</Text>
          <Text style={styles.tutorialText}>Encuentra el número correcto entre las distracciones.</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.score}>Puntuación: {score}</Text>
          <Icon name={levels[currentLevel].background} type="material-community" size={200} color="#000" />
          <View style={styles.iconsGrid}>
            {renderIcons()}
          </View>
        </View>
      )}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tutorial: {
    alignItems: 'center',
  },
  tutorialText: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    margin: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    margin: 10,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    position: 'absolute',
    top: 20,
    right: 20,
  }
});

export default Game;
