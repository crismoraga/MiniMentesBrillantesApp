import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Animatable from 'react-native-animatable';
import { svgPathProperties } from 'svg-path-properties';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext'; // Assuming you have this context

const NumberTracingGame = () => {
  const navigation = useNavigation();
  const [currentNumber, setCurrentNumber] = useState(1);
  const [tracedPoints, setTracedPoints] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFirstPartComplete, setIsFirstPartComplete] = useState(false);
  const maxNumber = 10;

  const { speakText, stopSpeak } = useAppContext();

  useEffect(() => {
    speakText(`Traza el número ${currentNumber}`);
    return () => stopSpeak();
  }, [currentNumber]);

  const numberPaths = {
    1: 'M 45,30 L 50,20 L 50,80', // 1
    2: 'M 30,30 C 30,25 35,20 50,20 C 65,20 70,25 70,35 C 70,45 65,50 50,50 C 35,50 30,55 30,65 C 30,75 35,80 70,80', // 2
    3: 'M 30,20 C 60,20 70,25 70,35 C 70,45 60,50 50,50 C 60,50 70,55 70,65 C 70,75 60,80 30,80', // 3
    4: 'M 55,80 L 55,20 M 35,50 L 55,50 M 35,50 L 55,20', // Número 4 con línea diagonal ajustada
    5: 'M 70,20 L 30,20 L 30,50 C 40,45 60,45 70,55 C 70,70 60,80 30,80', // 5
    6: 'M 60,20 C 50,20 40,40 40,60 C 40,80 60,80 60,60 C 60,40 50,40 50,60', // 6 corregido
    7: 'M 30,20 L 70,20 L 50,80', // 7
    8: 'M 50,25 C 35,25 35,50 50,50 C 65,50 65,25 50,25 M 50,50 C 35,50 35,75 50,75 C 65,75 65,50 50,50', // Número 8 más grande y centrado
    9: 'M 45,25 C 60,25 60,45 45,45 C 30,45 30,25 45,25 C 75,45 75,65 35,80', // Número 9 con curva pronunciada hacia la izquierda
    10: {
      1: 'M 25,20 L 25,80 M 15,80 L 35,80', // 1
      0: 'M 60,20 C 45,20 45,80 60,80 C 75,80 75,20 60,20', // 0
    },
  };

  const handleGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    // Convertir coordenadas del gesto al sistema de coordenadas del SVG
    const svgX = (x / 300) * 100;
    const svgY = (y / 300) * 100;
    setTracedPoints((points) => [...points, { x: svgX, y: svgY }]);
  };

  const handleGestureEnd = async () => {
    const isCorrect = checkTracingAccuracy();
    if (isCorrect) {
      await speakText('¡Excelente trabajo!');
      if (currentNumber === 10 && !isFirstPartComplete) {
        setIsFirstPartComplete(true);
        Toast.show({
          type: 'info',
          text1: '¡Bien! Ahora traza el 0',
          visibilityTime: 2000,
        });
      } else {
        if (currentNumber === maxNumber && (isFirstPartComplete || currentNumber !== 10)) {
          Toast.show({
            type: 'success',
            text1: '¡Felicitaciones! 🎉',
            text2: 'Has completado todos los números',
            visibilityTime: 3000,
          });
          setTimeout(() => navigation.navigate('MainGameScreen'), 3000);
        } else {
          Toast.show({
            type: 'success',
            text1: '¡Excelente! ⭐',
            text2: 'Preparando siguiente número...',
            visibilityTime: 2000,
          });
          setTimeout(() => {
            setCurrentNumber(prev => prev + 1);
            if (currentNumber === 10) setIsFirstPartComplete(false);
          }, 2000);
        }
      }
    } else {
      await speakText('Inténtalo de nuevo. Sigue las líneas punteadas con cuidado');
      Toast.show({
        type: 'error',
        text1: 'Inténtalo de nuevo 💪',
        text2: 'Sigue las líneas punteadas con cuidado',
        visibilityTime: 2000,
      });
    }
    setTracedPoints([]);
  };

  const checkTracingAccuracy = () => {
    try {
      if (tracedPoints.length < 5) return false;
      
      // Optimización: reducir puntos de muestra
      const samplePoints = tracedPoints.filter((_, index) => index % 3 === 0);
      
      if (currentNumber === 10) {
        // Lógica especial para el número 10
        if (!isFirstPartComplete) {
          const accuracy1 = checkPathAccuracy(numberPaths[10][1], samplePoints);
          if (accuracy1 > 0.7) {
            setIsFirstPartComplete(true);
            Toast.show({
              type: 'info',
              text1: '¡Bien! Ahora traza el 0',
              visibilityTime: 2000,
            });
          }
          return false;
        } else {
          const accuracy0 = checkPathAccuracy(numberPaths[10][0], samplePoints);
          if (accuracy0 > 0.7) {
            setIsFirstPartComplete(false);
            return true;
          }
          return false;
        }
      }

      return checkPathAccuracy(numberPaths[currentNumber], samplePoints) > 0.7;
    } catch (error) {
      console.error('Error en checkTracingAccuracy:', error);
      return false;
    }
  };

  const checkPathAccuracy = (path, points) => {
    const properties = new svgPathProperties(path);
    const totalLength = properties.getTotalLength();
    const step = totalLength / 20; // Reducido a 20 puntos de muestra
    let matchedPoints = 0;

    points.forEach((tracedPoint) => {
      for (let i = 0; i <= totalLength; i += step) {
        const point = properties.getPointAtLength(i);
        if (Math.hypot(point.x - tracedPoint.x, point.y - tracedPoint.y) < 10) {
          matchedPoints++;
          break;
        }
      }
    });

    return matchedPoints / points.length;
  };

  const getTracedPath = () => {
    if (tracedPoints.length === 0) return '';
    return tracedPoints.reduce((pathString, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${pathString} ${command}${point.x},${point.y}`;
    }, '');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Traza el número {currentNumber}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progreso: {currentNumber}/{maxNumber}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentNumber/maxNumber) * 100}%` }]} />
        </View>
      </View>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onEnded={handleGestureEnd}
      >
        <Animatable.View 
          animation="fadeIn"
          style={styles.tracingArea}
        >
          <Svg style={styles.svg} viewBox="0 0 100 100">
            {currentNumber === 10 ? (
              <>
                <Path
                  d={numberPaths[10][1]}
                  stroke={isFirstPartComplete ? "#4CAF50" : "#BDBDBD"}
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="5,5"
                />
                <Path
                  d={numberPaths[10][0]}
                  stroke="#BDBDBD"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="5,5"
                />
              </>
            ) : (
              <Path
                d={numberPaths[currentNumber]}
                stroke="#BDBDBD"
                strokeWidth={2}
                fill="none"
                strokeDasharray="5,5"
              />
            )}
            <Path
              d={getTracedPath()}
              stroke="#FF4081"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animatable.View>
      </PanGestureHandler>
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Consejo',
            text2: 'Traza el número siguiendo las líneas punteadas',
            visibilityTime: 3000,
          });
        }}
      >
        <Text style={styles.helpButtonText}>?</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    color: '#FF4081',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '80%',
    marginVertical: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#FF4081',
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#FFE0EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4081',
    borderRadius: 5,
  },
  tracingArea: {
    width: 300,
    height: 300,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB4D1',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: 20,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  helpButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4081',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  helpButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4081',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NumberTracingGame;
