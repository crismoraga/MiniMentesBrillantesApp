import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const NumberTracingGame = ({ ageGroup }) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [tracedPoints, setTracedPoints] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const maxNumber = ageGroup === '4-5' ? 10 : 20;

  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    setTracedPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  const handleStateChange = async (event) => {
    if (event.nativeEvent.state === State.END) {
      if (tracedPoints.length > 50) {
        setNotificationMessage(`¡Bien hecho! Has trazado el número ${currentNumber} correctamente.`);
        setShowNotification(true);
        await playSound(require('../assets/complete.mp3'));

        if (currentNumber < maxNumber) {
          setCurrentNumber((prevNumber) => prevNumber + 1);
        } else {
          setNotificationMessage('¡Felicidades! Has completado todos los números.');
          setShowNotification(true);
        }
      } else {
        setNotificationMessage('Inténtalo de nuevo. Traza sobre el número.');
        setShowNotification(true);
      }
      setTracedPoints([]);
    }
  };

  const renderNumber = (number) => {
    const numberPaths = {
      1: 'M50,10 L50,90',
      2: 'M20,30 Q50,10 80,30 T50,90',
      // ...agrega los trazos de los números restantes...
    };
    return (
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <Path d={numberPaths[number]} stroke="#E0E0E0" strokeWidth="5" fill="none" />
      </Svg>
    );
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Traza el número {currentNumber}</Text>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <View style={styles.tracingArea}>
          {renderNumber(currentNumber)}
          <Svg height="100%" width="100%" style={styles.drawing}>
            <Path
              d={
                tracedPoints.length > 0
                  ? `M${tracedPoints.map((p) => `${p.x},${p.y}`).join(' L')}`
                  : ''
              }
              stroke="#FF4081"
              strokeWidth="5"
              fill="none"
            />
          </Svg>
        </View>
      </PanGestureHandler>

      {/* Notificación personalizada */}
      <Modal transparent={true} visible={showNotification} animationType="fade">
        <View style={styles.notificationContainer}>
          <Animatable.View
            animation="bounceIn"
            duration={800}
            style={styles.notification}
          >
            <Text style={styles.notificationText}>{notificationMessage}</Text>
            <TouchableOpacity onPress={closeNotification} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Continuar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FCE4EC', // Use a solid background color
  },
  title: {
    fontSize: 32,
    color: '#FF4081',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  tracingArea: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  drawing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  notificationContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notification: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  notificationText: {
    fontSize: 24,
    color: '#FF4081',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF4081',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
});

export default NumberTracingGame;
