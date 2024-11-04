import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const NumberTracingGame = ({ ageGroup }) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [tracedPoints, setTracedPoints] = useState([]);
  const maxNumber = ageGroup === '4-5' ? 10 : 20;

  const handleGestureEvent = (event) => {
    const { x, y } = event.nativeEvent;
    setTracedPoints([...tracedPoints, { x, y }]);
  };

  const handleStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (tracedPoints.length > 5) {
        Alert.alert('¡Bien hecho!', `Has trazado el número ${currentNumber} correctamente.`);
        if (currentNumber < maxNumber) {
          setCurrentNumber(currentNumber + 1);
        } else {
          Alert.alert('¡Felicidades!', 'Has completado todos los números.');
        }
      } else {
        Alert.alert('Inténtalo de nuevo', 'No has trazado suficientes puntos.');
      }
      setTracedPoints([]);
    }
  };

  const renderNumber = (number) => {
    const points = Array.from({ length: number }, (_, i) => ({
      x: 50 + 30 * Math.cos((i * 2 * Math.PI) / number),
      y: 50 + 30 * Math.sin((i * 2 * Math.PI) / number),
    }));
    return (
      <Svg height="100" width="100">
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r="5" fill="black" />
        ))}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Traza el número {currentNumber}</Text>
      <PanGestureHandler onGestureEvent={handleGestureEvent} onHandlerStateChange={handleStateChange}>
        <View style={styles.tracingArea}>
          {renderNumber(currentNumber)}
          {tracedPoints.map((point, index) => (
            <Circle key={index} cx={point.x} cy={point.y} r="5" fill="red" />
          ))}
        </View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#006064',
  },
  tracingArea: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default NumberTracingGame;
