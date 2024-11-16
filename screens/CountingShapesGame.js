import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const CountingShapesGame = ({ ageGroup }) => {
  const [currentShape, setCurrentShape] = useState('circle');
  const [count, setCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const maxCount = ageGroup === '4-5' ? 5 : 10;

  useEffect(() => {
    const speakInstructions = async () => {
      await stopSpeak(); // Evitar superposición
      await speakText(`Cuenta las ${currentShape}s que aparecen en la pantalla tocándolas.`);
    };
    speakInstructions();
    return () => stopSpeak();
  }, [currentShape]);

  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const shapes = {
    circle: (color) => <Circle cx="50" cy="50" r="40" fill={color} />,
    square: (color) => <Rect x="10" y="10" width="80" height="80" fill={color} />,
    triangle: (color) => (
      <Polygon points="50,15 90,85 10,85" fill={color} />
    ),
  };

  const handleShapePress = async () => {
    await stopSpeak(); // Evitar superposición
    setCount(count + 1);

    if (count + 1 >= maxCount) {
      await speakText(`¡Excelente! Has contado todas las ${currentShape}s.`);
      setNotificationMessage(`¡Felicidades! Has contado ${maxCount} ${currentShape}s.`);
      setShowNotification(true);
      await playSound(require('../assets/complete.mp3'));

      setTimeout(() => {
        setCount(0);
        setCurrentShape(currentShape === 'circle' ? 'square' : 'circle');
        setShowNotification(false);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuenta las {currentShape}s</Text>
      <TouchableOpacity style={styles.shapeContainer} onPress={handleShapePress}>
        <Animatable.View animation="pulse" iterationCount="infinite" easing="ease-out">
          <Svg height="100" width="100">{shapes[currentShape]('#FF4081')}</Svg>
        </Animatable.View>
      </TouchableOpacity>
      <Text style={styles.countText}>Contador: {count}</Text>

      {/* Notificación personalizada */}
      <Modal transparent={true} visible={showNotification} animationType="fade">
        <View style={styles.notificationContainer}>
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            style={styles.notification}
          >
            <Text style={styles.notificationText}>{notificationMessage}</Text>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4081',
    marginBottom: 20,
  },
  shapeContainer: {
    marginBottom: 20,
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notification: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  notificationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
  },
});

export default CountingShapesGame;
