import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, Animated, Dimensions, Image, StyleSheet, 
  TouchableOpacity, Alert, ScrollView, ImageBackground, Easing, PanResponder 
} from 'react-native';
import { Audio } from 'expo-av';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Carousel from 'react-native-snap-carousel';

// Importa los componentes correctamente
import TimeBar from '../components/TimeBar';
import ShapeQuestion from '../components/ShapeQuestion';
import CustomButton from '../components/CustomButton';
import ProgressIndicator from '../components/ProgressIndicator';
import HintButton from '../components/HintButton';
import GameStats from '../components/GameStats';

// Añade el componente AnimatedGameStage que faltaba
const AnimatedGameStage = Animated.createAnimatedComponent(View);

// Define el componente ExamplesGallery que faltaba
const ExamplesGallery = ({ examples }) => (
  <View style={styles.examplesContainer}>
    {examples.map((example, index) => (
      <View key={index} style={styles.exampleBadge}>
        <Text style={styles.exampleText}>{example}</Text>
      </View>
    ))}
  </View>
);

const { width, height } = Dimensions.get('window');

const shapesInfo = [
  { 
    id: 1, 
    type: 'círculo', 
    sides: 0, 
    image: require('../assets/circle.png'), 
    location: 'en un reloj, el sol, o una pelota',
    gradient: ['#FF6B6B', '#FF8E8E'],
    backgroundColor: '#FFE5E5',
    examples: ['reloj', 'sol', 'pelota', 'moneda'],
    funFact: '¡Es la forma más perfecta en la naturaleza!',
    animations: {
      rotate: true,
      bounce: true
    }
  },
  { 
    id: 2, 
    type: 'cuadrado', 
    sides: 4, 
    image: require('../assets/square.png'), 
    location: 'en ventanas, cajas y pantallas',
    gradient: ['#4ECDC4', '#45B7AF'],
    backgroundColor: '#E0F7F5',
    examples: ['ventana', 'caja', 'pantalla', 'libro'],
    funFact: '¡Todos sus lados son iguales!',
    animations: {
      scale: true,
      flip: true
    }
  },
  { 
    id: 3, 
    type: 'triángulo', 
    sides: 3, 
    image: require('../assets/triangle.png'), 
    location: 'en señales de tráfico y techos',
    gradient: ['#FFD93D', '#FFB800'],
    backgroundColor: '#FFF8E1',
    examples: ['señal', 'techo', 'pizza', 'montaña'],
    funFact: '¡Es la forma más estable en construcción!',
    animations: {
      rotate: true,
      slide: true
    }
  },
  { 
    id: 4, 
    type: 'estrella', 
    sides: 5, 
    image: require('../assets/star.png'), 
    location: 'en el cielo y decoraciones',
    gradient: ['#A8E6CF', '#7DBF9E'],
    backgroundColor: '#E8F7F2',
    examples: ['cielo', 'premio', 'decoración', 'varita'],
    funFact: '¡Brilla como las estrellas del cielo!',
    animations: {
      shine: true,
      pulse: true
    }
  }
];

// Nuevas constantes para el juego
const TOTAL_STAGES = 5;
const POINTS_PER_CORRECT = 20;
const STREAK_MULTIPLIER = 1.5;
const DIFFICULTY_LEVELS = ['Fácil', 'Normal', 'Difícil'];

// Expandir shapesInfo con más información y ejemplos
const expandedShapesInfo = shapesInfo.map(shape => ({
  ...shape,
  difficulty: Math.floor(Math.random() * 3),
  hints: [
    `Tiene ${shape.sides} lados`,
    `La puedes encontrar en ${shape.examples[0]}`,
    `Es como ${shape.examples[1]}`
  ],
  challengeQuestions: [
    { question: `¿Cuántos lados tiene ${shape.type}?`, answer: shape.sides },
    { question: `¿Dónde puedes encontrar ${shape.type}?`, answer: shape.location },
    { question: `¿Por qué es especial ${shape.type}?`, answer: shape.funFact }
  ]
}));

const ParticleEffect = ({ x, y, scale, opacity, style }) => (
  <Animated.View
    style={[
      style,
      {
        transform: [
          { translateX: x },
          { translateY: y },
          { scale }
        ],
        opacity
      }
    ]}
  />
);

const ShapeSortingGame = ({ navigation }) => {
  // Corregir la inicialización del estado, cambiar shapes por shapesInfo
  const [draggables, setDraggables] = useState(shapesInfo);
  const [dropZones, setDropZones] = useState({});
  const [currentShape, setCurrentShape] = useState(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const [stage, setStage] = useState(1);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState([]);
  const [gameState, setGameState] = useState({
    currentStage: 1,
    score: 0,
    lives: 3,
    progression: 0,
    streak: 0,
    mistakes: 0
  });
  
  const [gameConfig, setGameConfig] = useState({
    difficulty: 0,
    showHints: true,
    timeLimit: 30,
    soundEnabled: true,
    hapticEnabled: true
  });
  
  const [gameMetrics, setGameMetrics] = useState({
    timeSpent: 0,
    hintsUsed: 0,
    perfectMatches: 0,
    totalAttempts: 0
  });

  const animations = {
    shape: useRef(new Animated.Value(0)).current,
    rotation: useRef(new Animated.Value(0)).current,
    bounce: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(1)).current,
    shake: useRef(new Animated.Value(0)).current,
    slideIn: useRef(new Animated.Value(width)).current,
    celebration: useRef(new Animated.Value(0)).current
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const createParticles = () => {
    const newParticles = Array(10).fill(0).map((_, i) => ({
      id: i,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (particles) => {
    particles.forEach(particle => {
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: (Math.random() - 0.5) * 200,
          duration: 1000,
          useNativeDriver: true,
        }),
        // ...more particle animations...
      ]).start(() => {
        setParticles([]);
      });
    });
  };

  const handleNextStage = () => {
    setStage(stage + 1);
    setCurrentShapeIndex(0);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      createParticles();
      setScore(score + 10);
      playSound('correct');
      Toast.show({
        type: 'success',
        text1: '¡Correcto!',
        visibilityTime: 2000,
      });
    } else {
      playSound('incorrect');
      Toast.show({
        type: 'error',
        text1: 'Inténtalo de nuevo',
        visibilityTime: 2000,
      });
      return;
    }
    const nextIndex = currentShapeIndex + 1;
    if (nextIndex < shapesInfo.length) {
      setCurrentShapeIndex(nextIndex);
    } else if (stage < 3) {
      handleNextStage();
    } else {
      Alert.alert('¡Felicidades!', 'Has completado el juego.', [
        { text: 'Reiniciar', onPress: () => setStage(1) },
      ]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        checkDropZone(gesture);
        pan.setValue({ x: 0, y: 0 });
        setCurrentShape(null);
      },
    })
  ).current;

  const setDropZoneValues = (event, type) => {
    const layout = event.nativeEvent.layout;
    setDropZones(prev => ({
      ...prev,
      [type]: {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height
      }
    }));
  };

  const checkDropZone = (gesture) => {
    const { moveX, moveY } = gesture;
    const dz = dropZones[currentShape?.type];
    if (
      dz &&
      moveX >= dz.x &&
      moveX <= dz.x + dz.width &&
      moveY >= dz.y &&
      moveY <= dz.y + dz.height
    ) {
      playSound('correct');
      Toast.show({
        type: 'success',
        text1: '¡Correcto!',
        text2: 'Has colocado la forma en el lugar correcto',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
      });
      setDraggables((prev) => prev.filter((item) => item.id !== currentShape.id));
    } else {
      playSound('incorrect');
      Toast.show({
        type: 'error',
        text1: 'Inténtalo de nuevo',
        text2: 'Esta no es la zona correcta',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    })();
  }, []);

  const playSound = async (type) => {
    try {
      const soundFile =
        type === 'correct'
          ? require('../assets/correct.mp3')
          : require('../assets/incorrect.mp3');
      const soundObj = new Audio.Sound();
      await soundObj.loadAsync(soundFile);
      await soundObj.playAsync();
      soundObj.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await soundObj.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const renderIntroductionStage = () => (
    <ScrollView horizontal pagingEnabled>
      {shapesInfo.map((shape) => (
        <LinearGradient
          key={shape.id}
          colors={shape.gradient}
          style={styles.card}>
          <Animated.View
            style={[{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }]}>
            <Image source={shape.image} style={styles.shapeImage} />
            <Text style={styles.infoText}>
              Esta es un(a) {shape.type}
              {'\n'}La puedes encontrar {shape.location}
            </Text>
          </Animated.View>
        </LinearGradient>
      ))}
    </ScrollView>
  );

  const animateShape = (shape) => {
    if (shape.animations.rotate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animations.rotation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true
          }),
          Animated.timing(animations.rotation, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
    // ...más animaciones específicas para cada forma...
  };

  const renderStageOne = () => (
    <Animated.View style={[styles.stageContainer, {
      transform: [{ translateX: animations.slideIn }]
    }]}>
      <Text style={styles.stageTitle}>Conoce las Formas</Text>
      <Carousel
        data={expandedShapesInfo}
        renderItem={({ item }) => (
          <ShapeCard 
            shape={item}
            onPress={() => playShapeIntroduction(item)}
            style={styles.shapeCard}
          />
        )}
        sliderWidth={width}
        itemWidth={width * 0.8}
        autoplay={true}
        enableMomentum={true}
        lockScrollWhileSnapping={true}
      />
      <View style={styles.navigationControls}>
        <CustomButton 
          title="Anterior"
          onPress={handlePrevShape}
          disabled={currentShapeIndex === 0}
        />
        <CustomButton 
          title="Siguiente"
          onPress={handleNextShape}
          disabled={currentShapeIndex === shapesInfo.length - 1}
        />
      </View>
      <ProgressIndicator 
        current={currentShapeIndex + 1}
        total={shapesInfo.length}
      />
    </Animated.View>
  );

  const renderStageTwo = () => (
    <AnimatedGameStage style={styles.quizContainer}>
      <TimeBar 
        duration={gameConfig.timeLimit}
        onTimeUp={handleTimeUp}
      />
      <ShapeQuestion 
        shape={currentShape}
        options={generateQuizOptions()}
        onAnswer={handleQuizAnswer}
        difficulty={gameConfig.difficulty}
      />
      <HintButton 
        hints={currentShape.hints}
        onUseHint={handleHintUsed}
        enabled={gameConfig.showHints}
      />
      <GameStats 
        score={gameState.score}
        streak={gameState.streak}
        multiplier={calculateMultiplier()}
      />
    </AnimatedGameStage>
  );

  const renderStageThree = () => (
    <DraggableShapeStage
      shapes={generateShapeChallenges()}
      onShapePlaced={handleShapePlacement}
      difficulty={gameConfig.difficulty}
      timeLimit={gameConfig.timeLimit}
      onComplete={handleStageComplete}
    />
  );

  // Utility functions
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const updateGameState = (isCorrect) => {
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 10 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      lives: !isCorrect ? prev.lives - 1 : prev.lives,
      progression: (currentShapeIndex / shapesInfo.length) * 100,
      mistakes: !isCorrect ? prev.mistakes + 1 : prev.mistakes
    }));

    if (gameState.lives <= 1 && !isCorrect) {
      Alert.alert(
        'Game Over',
        `Puntuación final: ${gameState.score}`,
        [{ text: 'Reintentar', onPress: resetGame }]
      );
    }
  };

  const resetGame = () => {
    setGameState({
      currentStage: 1,
      score: 0,
      lives: 3,
      progression: 0,
      streak: 0,
      mistakes: 0
    });
    setCurrentShapeIndex(0);
    setStage(1);
  };

  // Nuevas funciones de utilidad
  const playHapticFeedback = async (type) => {
    if (!gameConfig.hapticEnabled) return;
    switch(type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  };

  const handleTimeUp = () => {
    playHapticFeedback('error');
    handleAnswer(false);
  };

  const handleQuizAnswer = (isCorrect) => {
    playHapticFeedback(isCorrect ? 'success' : 'error');
    handleAnswer(isCorrect);
  };

  const handleShapePlacement = (isCorrect) => {
    playHapticFeedback(isCorrect ? 'success' : 'error');
    updateGameState(isCorrect);
    if (isCorrect) createParticles();
  };

  const calculateMultiplier = () => {
    return 1 + (gameState.streak * STREAK_MULTIPLIER);
  };

  // Nuevos componentes auxiliares
  const ShapeCard = ({ shape, onPress, style }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.shapeCard, style]}
    >
      <LinearGradient
        colors={shape.gradient}
        style={styles.cardGradient}
      >
        <Animated.Image 
          source={shape.image}
          style={[styles.shapeImage, {
            transform: [
              { scale: animations.bounce },
              { rotate: animations.rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })}
            ]
          }]}
        />
        <View style={styles.shapeInfo}>
          <Text style={styles.shapeName}>{shape.type}</Text>
          <Text style={styles.shapeFact}>{shape.funFact}</Text>
          <ExamplesGallery examples={shape.examples} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const generateQuizOptions = () => {
    const options = [...shapesInfo];
    return shuffleArray(options).slice(0, 4);
  };

  const generateShapeChallenges = () => {
    return shuffleArray(shapesInfo.map(shape => ({
      ...shape,
      position: { x: Math.random() * (width - 100), y: Math.random() * (height - 100) }
    })));
  };

  const handlePrevShape = () => {
    if (currentShapeIndex > 0) {
      setCurrentShapeIndex(currentShapeIndex - 1);
    }
  };

  const handleNextShape = () => {
    if (currentShapeIndex < shapesInfo.length - 1) {
      setCurrentShapeIndex(currentShapeIndex + 1);
    }
  };

  const handleHintUsed = (hint) => {
    setGameMetrics(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
    Toast.show({
      type: 'info',
      text1: 'Pista',
      text2: hint,
      visibilityTime: 3000,
    });
  };

  const playShapeIntroduction = async (shape) => {
    playHapticFeedback('light');
    animateShape(shape);
    if (gameConfig.soundEnabled) {
    }
  };

  // Corregir la variable en el método renderStageThree
  const DraggableShapeStage = ({ shapes, onShapePlaced, difficulty, timeLimit, onComplete }) => (
    <View style={styles.dragContainer}>
      {shapes.map((shape) => (
        <Animated.View
          key={shape.id}
          style={[
            styles.draggableShape,
            {
              transform: [
                { translateX: shape.position.x },
                { translateY: shape.position.y }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => onShapePlaced(true)}
            style={styles.shapeContainer}
          >
            <Image source={shape.image} style={styles.dragImage} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  // Añadir después de los otros métodos handle
  const handleStageComplete = () => {
    playHapticFeedback('success');
    handleNextStage();
    setGameMetrics(prev => ({
      ...prev,
      perfectMatches: prev.perfectMatches + 1
    }));
    Toast.show({
      type: 'success',
      text1: '¡Nivel completado!',
      text2: 'Pasando al siguiente nivel...',
      visibilityTime: 2000,
    });
  };

  return (
    <ImageBackground 
      style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientContainer}>
        {/* Stage content */}
        {stage === 1 && renderIntroductionStage()}
        {stage === 2 && renderQuestionStage()}
        {stage === 3 && renderSelectionStage()}

        {/* Score and progress */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Puntos: {score}</Text>
        </View>

        {/* Particle effects */}
        {particles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[styles.particle, {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale }
              ],
              opacity: particle.opacity,
            }]}
          />
        ))}
      </LinearGradient>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[styles.progressFill, {
              width: `${gameState.progression}%`
            }]}
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.livesContainer}>
            {Array(gameState.lives).fill().map((_, i) => (
              <Image 
                key={i}
                source={require('../assets/heart.png')}
                style={styles.heartIcon}
              />
            ))}
          </View>
          <Text style={styles.scoreText}>
            {gameState.score} puntos
          </Text>
        </View>
      </View>

      {/* Contenido principal del juego */}
      {gameState.currentStage === 1 && renderStageOne()}
      {gameState.currentStage === 2 && renderStageTwo()}
      {gameState.currentStage === 3 && renderStageThree()}

      {/* Efectos de partículas y retroalimentación */}
      {particles.map((particle, index) => (
        <ParticleEffect 
          key={index}
          {...particle}
          style={styles.particle}
        />
      ))}
    </ImageBackground>
  );
};

// Añadir los estilos adicionales al StyleSheet existente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FA'
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    width: width - 40,
    margin: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  shapeImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // ...más estilos para los nuevos elementos...
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 15,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 40
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 5
  },
  shapeCard: {
    margin: 20,
    padding: 20,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  shapeImageLarge: {
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
  question: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  questionImage: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: 40
  },
  optionGradient: {
    padding: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center'
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20
  },
  shapeContainer: {
    padding: 15,
    margin: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    elevation: 5
  },
  selectionImage: {
    width: 100,
    height: 100
  },
  stageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4
  },
  cardGradient: {
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  exampleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 5,
  },
  exampleText: {
    color: '#FFF',
    fontSize: 12,
  },
  stageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dragContainer: {
    flex: 1,
    position: 'relative',
  },
  draggableShape: {
    position: 'absolute',
  },
  dragImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});

export default ShapeSortingGame;