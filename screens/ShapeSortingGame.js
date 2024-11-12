import React, { useState, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { PanResponder } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const shapes = [
  { id: 1, type: 'circle', image: require('../assets/circle.png') },
  { id: 2, type: 'square', image: require('../assets/square.png') },
  { id: 3, type: 'triangle', image: require('../assets/triangle.png')},
  { id: 4, type: 'star', image: require('../assets/star.png') },
];

const ShapeSortingGame = ({ navigation }) => {
  const [draggables, setDraggables] = useState(shapes);
  const [dropZones, setDropZones] = useState({});
  const [currentShape, setCurrentShape] = useState(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const [stage, setStage] = useState(1);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);

  const shapesInfo = [
    { id: 1, type: 'círculo', sides: 0, image: require('../assets/circle.png') },
    { id: 2, type: 'cuadrado', sides: 4, image: require('../assets/square.png') },
    { id: 3, type: 'triángulo', sides: 3, image: require('../assets/triangle.png') },
    { id: 4, type: 'estrella', sides: 5, image: require('../assets/star.png') },
  ];

  const handleNextStage = () => {
    setStage(stage + 1);
    setCurrentShapeIndex(0);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
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
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
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

  return (
    <View style={styles.container}>
      {stage === 1 && (
        <View>
          <Text style={styles.title}>Conoce las figuras</Text>
          {shapesInfo.map((shape) => (
            <View key={shape.id} style={styles.infoContainer}>
              <Image source={shape.image} style={styles.shapeImage} />
              <Text style={styles.infoText}>
                Esta es un(a) {shape.type}, tiene {shape.sides} lados.
              </Text>
            </View>
          ))}
          <Button title="Siguiente" onPress={handleNextStage} />
        </View>
      )}
      {stage === 2 && (
        <View>
          <Text style={styles.title}>¿Qué figura estás viendo?</Text>
          <Image
            source={shapesInfo[currentShapeIndex].image}
            style={styles.shapeImage}
          />
          {shapesInfo.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleAnswer(option.id === shapesInfo[currentShapeIndex].id)}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>{option.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {stage === 3 && (
        <View>
          <Text style={styles.title}>
            Elige la figura {shapesInfo[currentShapeIndex].type}
          </Text>
          <View style={styles.optionsContainer}>
            {shapesInfo.map((shape) => (
              <TouchableOpacity
                key={shape.id}
                onPress={() => handleAnswer(shape.id === shapesInfo[currentShapeIndex].id)}
              >
                <Image source={shape.image} style={styles.shapeImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#F0F7FA',
  },
  title: {
    fontSize: 28,
    color: '#FF6F61',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: '600',
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#FFE0B2',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  shapeImage: {
    width: 80,
    height: 80,
  },
});

export default ShapeSortingGame;