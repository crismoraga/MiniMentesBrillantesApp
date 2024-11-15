import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, FlatList, Animated, Easing 
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Audio } from 'expo-av';
import Toast from 'react-native-toast-message';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext'; // Agregar esta importación

// Cambiamos la importación de AntDesign para usar @expo/vector-icons
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const shapes = [
  { 
    id: 1, 
    name: 'círculo', 
    image: require('../assets/circle.png')
  },
  { 
    id: 2, 
    name: 'cuadrado', 
    image: require('../assets/square.png')
  },
  { 
    id: 3, 
    name: 'triángulo', 
    image: require('../assets/triangle.png')
  },
  { 
    id: 4, 
    name: 'rectángulo', 
    image: require('../assets/rectangle.png')
  }
];

const recognitionShapes = [
  { 
    id: 1, 
    name: 'círculo', 
    sides: 0,
    examples: 'Rueda, moneda, reloj',
    info: 'No tiene lados ni esquinas',
    image: require('../assets/circle.png')
  },
  { 
    id: 2, 
    name: 'cuadrado', 
    sides: 4,
    examples: 'Caja, ventana, marco',
    info: 'Todos sus lados son iguales',
    image: require('../assets/square.png')
  },
  { 
    id: 3, 
    name: 'triángulo', 
    sides: 3,
    examples: 'Señal de tráfico, pirámide',
    info: 'Tiene tres esquinas',
    image: require('../assets/triangle.png')
  },
  { 
    id: 4, 
    name: 'rectángulo', 
    sides: 4,
    examples: 'Puerta, libro, televisión',
    info: 'Como un cuadrado alargado',
    image: require('../assets/rectangle.png')
  }
];

const distractors = [
  { 
    id: 5, 
    name: 'estrella', 
    image: require('../assets/star.png')
  },
  { 
    id: 6, 
    name: 'corazón', 
    image: require('../assets/heart.png')
  }
];

// Componentes optimizados con memo
const RecognitionCard = memo(({ item, fadeAnim, slideAnim, scaleAnim, rotateAnim, onLayout }) => (
  <Animated.View 
    style={[
      styles.card,
      {
        opacity: fadeAnim,
        transform: [
          { translateX: slideAnim },
          { scale: scaleAnim }
        ]
      }
    ]}
    onLayout={onLayout}
  >
    <LinearGradient
      colors={['#E0EAFC', '#CFDEF3']}
      style={styles.cardGradient}
    >
      <Animated.Image 
        source={item.image} 
        style={[styles.shapeImage, {
          transform: [{
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg']
            })
          }]
        }]}
      />
      <View style={styles.cardContent}>
        <Text style={styles.shapeName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
        <Text style={styles.shapeDetails}>Lados: {item.sides}</Text>
        <Text style={styles.shapeDetails}>Ejemplos: {item.examples}</Text>
        <Text style={styles.shapeInfo}>{item.info}</Text>
      </View>
    </LinearGradient>
  </Animated.View>
));

const ShapeOption = memo(({ item, onPress, style, isImage }) => (
  <TouchableOpacity
    style={[styles.shapeOptionButton, style]}
    onPress={() => onPress(isImage ? item : item.name)}
  >
    {isImage ? (
      <Image source={item.image} style={styles.optionImage} />
    ) : (
      <Text style={styles.optionText}>
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>
    )}
  </TouchableOpacity>
));

const ShapeSortingGame = ({ navigation }) => {
  const { speakText, stopSpeak } = useAppContext(); // Usar el hook aquí
  const [stage, setStage] = useState(1);
  const [currentShape, setCurrentShape] = useState(null);
  const [score, setScore] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [sound, setSound] = useState(null);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set());
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    // Inicializamos el currentShape al montar el componente
    if (stage === 2 || stage === 3) {
      if (!currentShape) {
        setCurrentShape(shapes[0]);
      }
      generateOptions();
      startTimer();
      animateShape();
    }
    return () => {
      stopTimer();
    };
  }, [stage]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const speakInstructions = async () => {
      if (stage === 1) {
        await speakText('¡Vamos a aprender sobre las formas! Primero, conoceremos cada figura. Desliza para ver todas.');
      } else if (stage === 2) {
        await speakText('Ahora, elige el nombre correcto para cada forma que aparezca.');
      } else if (stage === 3) {
        await speakText('Por último, selecciona la imagen que corresponda al nombre indicado.');
      }
    };
    speakInstructions();
    return () => stopSpeak();
  }, [stage]);

  const startTimer = () => {
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          Toast.show({
            type: 'error',
            text1: 'Tiempo agotado',
            text2: 'Inténtalo nuevamente',
            position: 'top',
          });
          loadNextShape();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const playSound = async (isCorrect) => {
    try {
      const soundFile = isCorrect
        ? require('../assets/correct.mp3')
        : require('../assets/incorrect.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile);
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const startStageTwo = () => {
    setStage(2);
    setShapeIndex(0);
    setCurrentShape(shapes[0]);
  };

  const startStageThree = () => {
    setStage(3);
    setShapeIndex(0);
    setCurrentShape(shapes[0]);
  };

  const restartGame = () => {
    setStage(1);
    setScore(0);
    setShapeIndex(0);
    setCurrentShape(null);
    setHintUsed(false);
    // Navegamos de vuelta a la selección de juegos
    navigation.navigate('MainGameScreen');
  };

  const generateOptions = () => {
    let optionsArray = [];
    if (stage === 2) {
      optionsArray = shuffleArray(shapes);
    } else if (stage === 3) {
      // Añadimos los distractores solo en la etapa de selección de imágenes
      optionsArray = shuffleArray([...shapes, ...distractors]);
    }
    setOptions(optionsArray);
  };

  const handleNameSelection = async (name) => {
    stopTimer();
    if (name === currentShape.name) {
      await speakText('¡Correcto! La respuesta es ' + currentShape.name);
      setScore(score + (hintUsed ? 5 : 10));
      await playSound(true);
      Toast.show({
        type: 'success',
        text1: '¡Correcto!',
        position: 'top',
      });
      loadNextShape();
    } else {
      await speakText(`Incorrecto. Inténtalo nuevamente. Recuerda que estamos buscando ${currentShape.name}`);
      await playSound(false);
      Toast.show({
        type: 'error',
        text1: 'Incorrecto',
        text2: 'Inténtalo nuevamente',
        position: 'top',
      });
    }
  };

  const handleShapeSelection = async (shape) => {
    stopTimer();
    if (shape.name === currentShape.name) {
      setScore(score + (hintUsed ? 5 : 10));
      await playSound(true);
      Toast.show({
        type: 'success',
        text1: '¡Correcto!',
        position: 'top',
      });
      loadNextShape();
    } else {
      await playSound(false);
      Toast.show({
        type: 'error',
        text1: 'Incorrecto',
        text2: 'Inténtalo nuevamente',
        position: 'top',
      });
    }
  };

  const loadNextShape = () => {
    stopTimer();
    setHintUsed(false);
    if (shapeIndex < shapes.length - 1) {
      setShapeIndex(shapeIndex + 1);
      setCurrentShape(shapes[shapeIndex + 1]);
    } else {
      if (stage === 2) {
        Toast.show({
          type: 'info',
          text1: 'Etapa completada',
          text2: 'Pasando a la siguiente etapa',
          position: 'top',
        });
        setTimeout(() => {
          startStageThree();
        }, 2000);
      } else if (stage === 3) {
        Toast.show({
          type: 'success',
          text1: '¡Juego completado!',
          text2: `Tu puntuación final es: ${score}`,
          position: 'top',
        });
        setTimeout(() => {
          restartGame();
        }, 3000);
      }
    }
  };

  const animateShape = () => {
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ),
    ]).start();
  };

  const useHint = async () => {
    if (!hintUsed) {
      setHintUsed(true);
      setScore(score - 5 >= 0 ? score - 5 : 0);
      Toast.show({
        type: 'info',
        text1: 'Pista',
        text2: `La forma empieza con "${currentShape.name.charAt(0).toUpperCase()}"`,
        position: 'top',
      });
      await speakText(`Pista: La forma empieza con la letra ${currentShape.name.charAt(0).toUpperCase()}`);
    }
  };

  const animateCard = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetCardAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(width);
    scaleAnim.setValue(0.5);
  };

  const handleSnapToItem = async (index) => {
    const shape = recognitionShapes[index];
    await speakText(
      `Esta es la forma ${shape.name}. ${shape.info}. 
      Tiene ${shape.sides} lados. 
      Algunos ejemplos son: ${shape.examples}`
    );
    setViewedCards(prev => new Set([...prev, index]));
    if (viewedCards.size === recognitionShapes.length - 1) {
      setTimeout(() => {
        startStageTwo();
      }, 1000);
    }
  };

  const keyExtractor = (item) => item.id.toString();

  const renderStageOne = () => (
    <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.stageContainer}>
      <Text style={styles.instructionTitle}>Conoce las Figuras Geométricas</Text>
      <Text style={styles.instructionSubtitle}>Desliza para ver todas</Text>
      <Carousel
        data={recognitionShapes} 
        renderItem={renderRecognitionItem}
        sliderWidth={width}
        itemWidth={width * 0.85}
        onSnapToItem={handleSnapToItem}
        inactiveSlideScale={0.9}
        inactiveSlideOpacity={0.7}
        containerCustomStyle={styles.carousel}
        slideStyle={styles.slideStyle}
      />
      <View style={styles.progressContainer}>
        {recognitionShapes.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot,
              viewedCards.has(index) && styles.progressDotActive
            ]} 
          />
        ))}
      </View>
    </LinearGradient>
  );

  const renderRecognitionItem = ({ item }) => (
    <RecognitionCard
      item={item}
      fadeAnim={fadeAnim}
      slideAnim={slideAnim}
      scaleAnim={scaleAnim}
      rotateAnim={rotateAnim}
      onLayout={() => {
        resetCardAnimation();
        animateCard();
      }}
    />
  );

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, {
      transform: [{ scale: scaleAnim }]
    }]}>
      <Image source={item.image} style={styles.shapeImage} />
      <Text style={styles.shapeName}>{capitalizeFirstLetter(item.name)}</Text>
    </Animated.View>
  );

  const renderStageTwo = () => (
    <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.centeredContainer}>
      {currentShape && (
        <>
          <Animated.Image 
            source={currentShape.image} 
            style={[styles.largeShapeImage, {
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }]} 
          />
          <View style={styles.timerContainer}>
            <Progress.Bar 
              progress={timer / 30} 
              width={width * 0.8} 
              color="#4ECDC4" 
              animationType="timing"
            />
            <Text style={styles.timerText}>{timer} s</Text>
          </View>
          <View style={styles.optionsContainer}>
            {options.map((shape) => (
              <ShapeOption
                key={shape.id}
                item={shape}
                onPress={handleNameSelection}
                style={styles.optionButton}
              />
            ))}
          </View>
          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={useHint} style={styles.hintButton}>
              <AntDesign name="questioncircleo" size={24} color="#fff" />
              <Text style={styles.hintText}>Pista</Text>
            </TouchableOpacity>
            <Text style={styles.scoreText}>Puntuación: {score}</Text>
          </View>
        </>
      )}
    </LinearGradient>
  );

  const renderStageThree = () => (
    <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.centeredContainer}>
      {currentShape && (
        <>
          <Text style={styles.instructionText}>Elige el {currentShape.name}</Text>
          <View style={styles.timerContainer}>
            <Progress.Bar 
              progress={timer / 30} 
              width={width * 0.8} 
              color="#4ECDC4" 
              animationType="timing"
            />
            <Text style={styles.timerText}>{timer} s</Text>
          </View>
          <FlatList
            data={options}
            numColumns={2}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <ShapeOption
                item={item}
                onPress={handleShapeSelection}
                isImage
              />
            )}
            columnWrapperStyle={styles.row}
            style={styles.flatList}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={true}
          />
          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={useHint} style={styles.hintButton}>
              <AntDesign name="questioncircleo" size={24} color="#fff" />
              <Text style={styles.hintText}>Pista</Text>
            </TouchableOpacity>
            <Text style={styles.scoreText}>Puntuación: {score}</Text>
          </View>
        </>
      )}
    </LinearGradient>
  );

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const shuffleArray = (array) => {
    let shuffledArray = array.slice();
    for (let i = 0; i < shuffledArray.length; i++) {
      let j = Math.floor(Math.random() * shuffledArray.length);
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  return (
    <View style={styles.container}>
      {stage === 1 && renderStageOne()}
      {stage === 2 && renderStageTwo()}
      {stage === 3 && renderStageThree()}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FA',
  },
  stageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.85,
    height: 450,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  shapeImage: {
    width: 180,
    height: 180,
    marginBottom: 15,
  },
  shapeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  shapeDetails: {
    fontSize: 18,
    color: '#636E72',
    marginTop: 8,
    textAlign: 'center',
  },
  shapeInfo: {
    fontSize: 16,
    color: '#74B9FF',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  shapeImage: {
    width: 150,
    height: 150,
  },
  shapeName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  shapeDetails: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  largeShapeImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '40%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  optionImage: {
    width: 100,
    height: 100,
  },
  shapeOptionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 10,
  },
  hintText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 18,
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 40,
  },
  instructionSubtitle: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 20,
    textAlign: 'center',
  },
  carousel: {
    flex: 1,
    marginTop: 20,
  },
  slideStyle: {
    paddingVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DFE6E9',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#74B9FF',
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  flatList: {
    width: '100%',
  },
});

export default ShapeSortingGame;