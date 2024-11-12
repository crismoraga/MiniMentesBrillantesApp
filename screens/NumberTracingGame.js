import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { svgPathProperties } from 'svg-path-properties';
import completeSound from '../assets/complete.mp3';
import { measure } from 'react-native-reanimated';

const NumberTracingGame = ({ ageGroup, navigation }) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [tracedPoints, setTracedPoints] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const maxNumber = ageGroup === '4-5' ? 10 : 20;
  const [isTracingCorrect, setIsTracingCorrect] = useState(false);
  const [tracingAreaLayout, setTracingAreaLayout] = useState(null);
  const [tracingAreaOffset, setTracingAreaOffset] = useState({ x: 0, y: 0 });
  const tracingAreaRef = React.useRef(null);

  // Añadir validación de prop
  if (!ageGroup) {
    ageGroup = '4-5'; // valor por defecto
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          staysActiveInBackground: false,
        });
        if (isMounted && showTutorial) {
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [showTutorial]);

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    setNotificationMessage('Ocurrió un error. Por favor, inténtalo de nuevo.');
    setShowNotification(true);
  };

  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(error => 
            console.error('Error unloading sound:', error)
          );
        }
      });
    } catch (error) {
      handleError(error, 'playSound');
    }
  };

  const numberPaths = {
    1: {
      path: 'M 50,20 L 50,80',
      startPoint: { x: 50, y: 20 },
      guides: [
        { x: 50, y: 20 },
        { x: 50, y: 35 },
        { x: 50, y: 50 },
        { x: 50, y: 65 },
        { x: 50, y: 80 }
      ]
    },
    2: {
      path: 'M 30,30 C 30,30 50,20 70,30 C 90,40 30,70 30,70 L 70,70',
      startPoint: { x: 30, y: 30 },
      guides: [
        { x: 30, y: 30 },
        { x: 50, y: 25 },
        { x: 70, y: 30 },
        { x: 60, y: 50 },
        { x: 40, y: 70 },
        { x: 70, y: 70 }
      ]
    },
    3: {
      path: 'M 30,30 C 50,20 70,30 70,30 C 50,40 70,60 70,60 C 50,80 30,70 30,70',
      startPoint: { x: 30, y: 30 },
      guides: [
        { x: 30, y: 30 },
        { x: 50, y: 25 },
        { x: 70, y: 30 },
        { x: 70, y: 45 },
        { x: 70, y: 60 },
        { x: 50, y: 70 },
        { x: 30, y: 70 }
      ]
    },
    4: {
      path: 'M 70,20 L 70,80 M 30,50 L 70,50',
      startPoint: { x: 70, y: 20 },
      guides: [
        { x: 70, y: 20 },
        { x: 70, y: 35 },
        { x: 70, y: 50 },
        { x: 30, y: 50 },
        { x: 50, y: 50 },
        { x: 70, y: 65 },
        { x: 70, y: 80 }
      ]
    },
    5: {
      path: 'M 70,20 L 30,20 L 30,50 C 50,45 70,50 70,65 C 70,80 30,80 30,65',
      startPoint: { x: 70, y: 20 },
      guides: [
        { x: 70, y: 20 },
        { x: 50, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 35 },
        { x: 30, y: 50 },
        { x: 50, y: 50 },
        { x: 70, y: 65 },
        { x: 50, y: 80 },
        { x: 30, y: 65 }
      ]
    },
    6: {
      path: 'M 60,20 C 30,20 30,50 30,50 C 30,80 70,80 70,50 C 70,20 30,50 30,50',
      startPoint: { x: 60, y: 20 },
      guides: [
        { x: 60, y: 20 },
        { x: 45, y: 20 },
        { x: 30, y: 35 },
        { x: 30, y: 50 },
        { x: 30, y: 65 },
        { x: 50, y: 80 },
        { x: 70, y: 65 },
        { x: 70, y: 50 }
      ]
    },
    7: {
      path: 'M 30,20 L 70,20 L 50,80',
      startPoint: { x: 30, y: 20 },
      guides: [
        { x: 30, y: 20 },
        { x: 50, y: 20 },
        { x: 70, y: 20 },
        { x: 60, y: 50 },
        { x: 50, y: 80 }
      ]
    },
    8: {
      path: 'M 50,20 C 20,20 20,50 50,50 C 80,50 80,80 50,80 C 20,80 20,50 50,50 C 80,50 80,20 50,20',
      startPoint: { x: 50, y: 20 },
      guides: [
        { x: 50, y: 20 },
        { x: 30, y: 25 },
        { x: 30, y: 40 },
        { x: 50, y: 50 },
        { x: 70, y: 60 },
        { x: 70, y: 75 },
        { x: 50, y: 80 },
        { x: 30, y: 75 },
        { x: 30, y: 60 }
      ]
    },
    9: {
      path: 'M 50,20 C 70,20 70,35 50,50 C 30,65 30,80 50,80 C 70,80 70,65 50,50',
      startPoint: { x: 50, y: 20 },
      guides: [
        { x: 50, y: 20 },
        { x: 70, y: 25 },
        { x: 70, y: 35 },
        { x: 50, y: 50 },
        { x: 30, y: 65 },
        { x: 30, y: 80 },
        { x: 50, y: 80 }
      ]
    },
    10: {
      path: 'M 30,20 L 30,80 M 60,20 C 80,20 80,50 60,50 C 40,50 40,80 60,80',
      startPoint: { x: 30, y: 20 },
      guides: [
        { x: 30, y: 20 },
        { x: 30, y: 50 },
        { x: 30, y: 80 },
        { x: 60, y: 20 },
        { x: 80, y: 35 },
        { x: 70, y: 50 },
        { x: 60, y: 50 },
        { x: 50, y: 65 },
        { x: 60, y: 80 }
      ]
    }
  };

  const renderGuidePoints = (number) => {
    if (!numberPaths[number]?.guides) return null;
    return (
      <>
        {numberPaths[number].guides.map((point, index) => (
          <React.Fragment key={index}>
            <Circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={index === 0 ? "#4CAF50" : "#BDBDBD"}
              strokeWidth="1"
              stroke="#757575"
            />
            {index === 0 && (
              <Circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="2"
                opacity="0.5"
              />
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const checkTracing = () => {
    try {
      const properties = new svgPathProperties(numberPaths[currentNumber].path);
      const length = properties.getTotalLength();
      const step = length / 100; // Número de puntos a calcular
      let matchedPoints = 0;

      for (let i = 0; i <= length; i += step) {
        const { x, y } = properties.getPointAtLength(i);
        tracedPoints.forEach((point) => {
          const distance = Math.hypot(point.x - x, point.y - y);
          if (distance < 5) {
            matchedPoints++;
          }
        });
      }

      const similarity = matchedPoints / (length / step);
      return similarity > 0.7; // Ajustar el umbral según sea necesario
    } catch (error) {
      handleError(error, 'checkTracing');
      return false;
    }
  };

  const handleGestureEvent = (event) => {
    try {
      if (!tracingAreaLayout || !tracingAreaLayout.width || !tracingAreaLayout.height) {
        // Si las dimensiones no están definidas, no procesar el evento
        return;
      }

      const { locationX, locationY } = event.nativeEvent;

      // Usar las coordenadas relativas directamente del evento
      const svgX = (locationX / tracingAreaLayout.width) * 100;
      const svgY = (locationY / tracingAreaLayout.height) * 100;

      console.log('Coordenadas del trazo:', { x: svgX, y: svgY });

      setTracedPoints(prevPoints => [...prevPoints, { x: svgX, y: svgY }]);
    } catch (error) {
      console.error('Error en handleGestureEvent:', error);
    }
  };

  const handleStateChange = async (event) => {
    if (event.nativeEvent.state === State.END) {
      const tracingResult = checkTracing();
      if (tracingResult) {
        setIsTracingCorrect(true);
        setNotificationMessage(`¡Bien hecho! Has trazado el número ${currentNumber} correctamente.`);
        await playSound(completeSound);
      } else {
        setIsTracingCorrect(false);
        setNotificationMessage('Inténtalo de nuevo. Sigue la línea punteada.');
      }
      setShowNotification(true);
      setTracedPoints([]);
    }
  };

  const renderNumber = (number) => {
    if (!numberPaths[number]) return null; // Solo verificar numberPaths
  
    return (
      <View style={styles.svgContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          <Path
            d={numberPaths[number].path}
            stroke="#BDBDBD"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
          {renderGuidePoints(number)}
          
          {/* Flecha de inicio */}
          <Path
            d={`M ${numberPaths[number].startPoint.x-5},${numberPaths[number].startPoint.y-10} 
                L ${numberPaths[number].startPoint.x},${numberPaths[number].startPoint.y-5} 
                L ${numberPaths[number].startPoint.x+5},${numberPaths[number].startPoint.y-10}`}
            stroke="#4CAF50"
            strokeWidth="2"
            fill="none"
          />
  
          {/* Trazado del usuario */}
          <Path
            d={
              tracedPoints.length > 0
                ? `M${tracedPoints.map((p) => `${p.x},${p.y}`).join(' L')}`
                : ''
            }
            stroke="#FF1744"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  };
  

  const finishGame = () => {
    setNotificationMessage('¡Felicidades! Has completado todos los números.');
    setIsTracingCorrect(false);
    setShowNotification(true);
    // Guardar progreso o navegar si es necesario
    setTimeout(() => {
      navigation?.navigate('MainGameScreen');
    }, 2000);
  };

  const closeNotification = () => {
    setShowNotification(false);
    if (isTracingCorrect) {
      if (currentNumber < maxNumber) {
        setCurrentNumber((prevNumber) => prevNumber + 1);
      } else {
        finishGame();
      }
    }
    setTracedPoints([]); // Reiniciar el trazo al cerrar la notificación
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    // Reproducir sonido de inicio si es necesario
  };

  const restartGame = () => {
    setCurrentNumber(1);
    setTracedPoints([]);
    setIsTracingCorrect(false);
    setShowNotification(false);
  };

  return (
    <View style={styles.container}>
      {showTutorial ? (
        <Modal transparent={true} visible={showTutorial} animationType="fade">
          <View style={styles.tutorialContainer}>
            <Animatable.View animation="bounceIn" duration={800} style={styles.tutorial}>
              <Text style={styles.tutorialText}>¡Bienvenido! Sigue las líneas punteadas para trazar los números.</Text>
              {/* Agregar una animación o imagen que muestre cómo trazar */}
              <Animatable.Image
                animation="pulse"
                iterationCount="infinite"
                style={styles.tutorialImage}
              />
              <TouchableOpacity onPress={closeTutorial} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Comenzar</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>
      ) : (
        <>
          <Text style={styles.title}>Traza el número {currentNumber}</Text>
          <Text style={styles.progressText}>Progreso: {currentNumber}/{maxNumber}</Text>
          <View style={styles.gameArea}>
            <PanGestureHandler
              onGestureEvent={handleGestureEvent}
              onHandlerStateChange={handleStateChange}
              minDist={0}
            >
              <View
                ref={tracingAreaRef}
                collapsable={false}
                style={styles.tracingArea}
                onLayout={(event) => {
                  const { x, y, width, height } = event.nativeEvent.layout;
                  setTracingAreaLayout({
                    x,
                    y,
                    width,
                    height
                  });
                }}
              >
                {renderNumber(currentNumber)}
              </View>
            </PanGestureHandler>
          </View>
          <TouchableOpacity onPress={restartGame} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Reiniciar</Text>
          </TouchableOpacity>

          {/* Notificación personalizada */}
          <Modal transparent={true} visible={showNotification} animationType="fade">
            <View style={styles.notificationContainer}>
              <Animatable.View
                animation="bounceIn"
                duration={500}
                style={styles.notification}
              >
                <Text style={styles.notificationText}>{notificationMessage}</Text>
                <TouchableOpacity onPress={closeNotification} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Continuar</Text>
                </TouchableOpacity>
              </Animatable.View>
            </View>
          </Modal>
        </>
      )}
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
    width: '90%',
    aspectRatio: 1,
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorial: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  tutorialText: {
    fontSize: 24,
    color: '#FF4081',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    color: '#FF4081',
    textAlign: 'center',
    marginVertical: 5,
  },
  tutorialImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  restartButton: {
    backgroundColor: '#FF4081',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 20,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  gameArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(NumberTracingGame);
