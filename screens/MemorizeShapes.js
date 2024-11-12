import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Text, 
  Animated, 
  Alert
} from 'react-native';
import Svg, { Circle, Rect, Polygon, Path } from 'react-native-svg';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const shapes = [
  'circle',
  'square',
  'triangle',
  'rectangle',
  'star',
  'circle',
  'square',
  'triangle',
  'rectangle',
  'star',
];

const MemorizeShapes = () => {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [sounds, setSounds] = useState({});
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    initializeGame();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isGameActive]);

  useEffect(() => {
    if (matchedPairs.length === shapes.length) {
      clearInterval(timerRef.current);
      showVictoryMessage();
    }
  }, [matchedPairs]);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const loadSounds = async () => {
    const soundFiles = {
      correct: require('../assets/correct.mp3'),
      incorrect: require('../assets/incorrect.mp3'),
      complete: require('../assets/complete.mp3'),
    };

    const loadedSounds = {};
    for (const [key, file] of Object.entries(soundFiles)) {
      const { sound } = await Audio.Sound.createAsync(file);
      loadedSounds[key] = sound;
    }
    setSounds(loadedSounds);
  };

  const unloadSounds = async () => {
    for (const sound of Object.values(sounds)) {
      await sound.unloadAsync();
    }
  };

  const playSound = async (soundName) => {
    try {
      await sounds[soundName].replayAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const initializeGame = () => {
    const shuffledCards = shapes
      .sort(() => Math.random() - 0.5)
      .map((shape, index) => ({
        id: index,
        shape: shape,
        isFlipped: false,
        flipAnimation: new Animated.Value(0)
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setAttempts(0);
    setTimer(0);
    setIsGameActive(true);
  };

  const flipCard = (animation, toValue) => {
    Animated.spring(animation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = async (cardId) => {
    if (!isGameActive) return;
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    flipCard(cards[cardId].flipAnimation, 1);

    if (newFlippedCards.length === 2) {
      setAttempts(prev => prev + 1);
      const [firstCard, secondCard] = newFlippedCards;
      
      if (cards[firstCard].shape === cards[secondCard].shape) {
        await playSound('correct');
        const newMatchedPairs = [...matchedPairs, firstCard, secondCard];
        setMatchedPairs(newMatchedPairs);
        setFlippedCards([]);
        
        if (newMatchedPairs.length === shapes.length) {
          await playSound('complete');
          setTimeout(() => showVictoryMessage(), 500);
        }
      } else {
        await playSound('incorrect');
        setTimeout(() => {
          flipCard(cards[firstCard].flipAnimation, 0);
          flipCard(cards[secondCard].flipAnimation, 0);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const showVictoryMessage = () => {
    Alert.alert(
      '¡Felicitaciones! 🎉',
      `Has completado el juego en:\nIntentos: ${attempts}\nTiempo: ${timer} segundos`,
      [
        {
          text: 'Jugar de nuevo',
          onPress: initializeGame
        },
        {
          text: 'Volver al menú',
          onPress: () => navigation.navigate('MainGameScreen')
        }
      ]
    );
  };

  const Tutorial = () => (
    <Modal
      transparent={true}
      visible={showTutorial}
      animationType="fade"
    >
      <View style={styles.tutorialContainer}>
        <View style={styles.tutorialContent}>
          <Text style={styles.tutorialTitle}>¿Cómo jugar?</Text>
          <Text style={styles.tutorialText}>
            1. Toca las cartas para voltearlas{'\n'}
            2. Encuentra los pares de figuras iguales{'\n'}
            3. Completa todos los pares para ganar{'\n'}
            4. ¡Intenta hacerlo en el menor tiempo posible!
          </Text>
          <TouchableOpacity 
            style={styles.tutorialButton}
            onPress={() => setShowTutorial(false)}
          >
            <Text style={styles.tutorialButtonText}>¡Comenzar!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderShape = (shape) => {
    switch (shape) {
      case 'circle':
        return <Circle cx="25" cy="25" r="20" fill="#FF6B6B" />;
      case 'square':
        return <Rect x="5" y="5" width="40" height="40" fill="#4ECDC4" />;
      case 'triangle':
        return <Polygon points="25,5 45,45 5,45" fill="#45B7D1" />;
      case 'rectangle':
        return <Rect x="5" y="15" width="40" height="20" fill="#96CEB4" />;
      case 'star':
        return (
          <Path
            d="M25 5 L30 20 L45 20 L35 30 L40 45 L25 35 L10 45 L15 30 L5 20 L20 20 Z"
            fill="#FFBE0B"
          />
        );
    }
  };

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Tutorial />
      <Animatable.View animation="slideInDown" style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Intentos</Text>
            <Text style={styles.statValue}>{attempts}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tiempo</Text>
            <Text style={styles.statValue}>{timer}s</Text>
          </View>
        </View>
      </Animatable.View>
      <View style={styles.grid}>
        {cards.map((card) => {
          const flipRotation = card.flipAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
          });

          return (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card.id)}
            >
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [{ rotateY: flipRotation }]
                  }
                ]}
              >
                {(flippedCards.includes(card.id) || matchedPairs.includes(card.id)) ? (
                  <Svg height="50" width="50">
                    {renderShape(card.shape)}
                  </Svg>
                ) : (
                  <View style={styles.cardBack} />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Animatable.View animation="slideInUp" style={styles.footer}>
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFlipped: {
    backgroundColor: '#FFFFFF',
  },
  cardBack: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tutorialText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#666',
  },
  tutorialButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  tutorialButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  menuButton: {
    backgroundColor: '#4CAF50',
  },
});

export default MemorizeShapes;
