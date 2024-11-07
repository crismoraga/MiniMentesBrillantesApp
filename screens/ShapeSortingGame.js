import React, { useState, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { PanResponder } from 'react-native';
import { Audio } from 'expo-av';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const shapes = [
  { id: 1, type: 'circle', image: require('../assets/circle.png') },
  { id: 2, type: 'square', image: require('../assets/square.png') },
  { id: 3, type: 'triangle', image: require('../assets/triangle.png') },
];

const ShapeSortingGame = ({ navigation }) => {
  const [draggables, setDraggables] = useState(shapes);
  const [dropZones, setDropZones] = useState({});
  const [currentShape, setCurrentShape] = useState(null);
  const pan = useRef(new Animated.ValueXY()).current;

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

  const playSound = async (type) => {
    try {
      const soundFile =
        type === 'correct'
          ? require('../assets/correct.mp3')
          : require('../assets/incorrect.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clasifica las formas</Text>
      <View style={styles.dropZoneContainer}>
        <View
          style={styles.dropZone}
          onLayout={(event) => setDropZoneValues(event, 'circle')}
        >
          <Text style={styles.dropZoneText}>Círculo</Text>
        </View>
        <View
          style={styles.dropZone}
          onLayout={(event) => setDropZoneValues(event, 'square')}
        >
          <Text style={styles.dropZoneText}>Cuadrado</Text>
        </View>
        <View
          style={styles.dropZone}
          onLayout={(event) => setDropZoneValues(event, 'triangle')}
        >
          <Text style={styles.dropZoneText}>Triángulo</Text>
        </View>
      </View>
      <View style={styles.draggableContainer}>
        {draggables.map((shape) => (
          <Animated.View
            key={shape.id}
            style={
              currentShape && currentShape.id === shape.id
                ? [styles.shapeImage, pan.getLayout()]
                : styles.shapeImage
            }
            {...(currentShape && currentShape.id === shape.id
              ? panResponder.panHandlers
              : null)}
          >
            <Image
              source={shape.image}
              style={styles.shapeImage}
              onStartShouldSetResponder={() => {
                setCurrentShape(shape);
                return true;
              }}
            />
          </Animated.View>
        ))}
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#F0F7FA', // Add solid background color
  },
  title: {
    fontSize: 28,
    color: '#FF6F61',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 50,
  },
  dropZone: {
    width: width * 0.25,
    height: height * 0.15,
    backgroundColor: '#FFE0B2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: '600',
  },
  draggableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shapeImage: {
    width: 80,
    height: 80,
  },
});

export default ShapeSortingGame;