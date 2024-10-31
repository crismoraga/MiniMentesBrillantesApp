import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

const shapes = {
  "4-5": ["circle", "square", "rectangle"],
  "5-6": ["circle", "square", "rectangle", "star", "flower"],
};

const ShapeSortingGame2 = ({ ageGroup = "4-5" }) => {
  const availableShapes = shapes[ageGroup] || [];
  const [phase, setPhase] = useState("learning");
  const [correctDrops, setCorrectDrops] = useState(0);
  const [currentShape, setCurrentShape] = useState(availableShapes[0]);
  const [draggedShape, setDraggedShape] = useState(null);

  const handleDrop = (shape) => {
    if (shape === currentShape) {
      setCorrectDrops(correctDrops + 1);
      Alert.alert("¡Correcto!", "Figura colocada correctamente.");
    } else {
      Alert.alert("Inténtalo de nuevo", "Esa figura no corresponde aquí.");
    }
    if (correctDrops >= availableShapes.length - 1) {
      Alert.alert("¡Completado!", "Has terminado el juego.");
      setPhase("completed");
    } else {
      setCurrentShape(availableShapes[correctDrops + 1]);
    }
  };

  const onGestureEvent = (event) => {
    setDraggedShape(currentShape);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      setDraggedShape(null);
    }
  };

  const renderShape = (shape) => {
    switch (shape) {
      case "circle":
        return <Circle cx="50" cy="50" r="40" fill="blue" />;
      case "square":
        return <Rect x="10" y="10" width="80" height="80" fill="red" />;
      case "rectangle":
        return <Rect x="5" y="20" width="90" height="60" fill="green" />;
      case "star":
        return (
          <Polygon
            points="50,15 61,35 82,35 67,50 74,70 50,57 26,70 33,50 18,35 39,35"
            fill="yellow"
          />
        );
      case "flower":
        return (
          <Svg height="100" width="100">
            <Circle cx="50" cy="50" r="10" fill="purple" />
            {[...Array(5)].map((_, i) => (
              <Circle
                key={i}
                cx={50 + 20 * Math.cos((i * 2 * Math.PI) / 5)}
                cy={50 + 20 * Math.sin((i * 2 * Math.PI) / 5)}
                r="10"
                fill="pink"
              />
            ))}
          </Svg>
        );
      default:
        return null;
    }
  };

  const renderDropZones = () => (
    <View style={styles.dropZoneContainer}>
      {availableShapes.map((shape, index) => (
        <TouchableOpacity
          key={index}
          style={styles.dropZone}
          onPress={() => handleDrop(shape)}
        >
          <Text style={styles.dropZoneText}>{shape}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTutorial = () => {
    if (phase === "learning") {
      return (
        <View style={styles.tutorialContainer}>
          <Text style={styles.tutorialText}>
            "Arrastra cada figura a la zona correspondiente."
          </Text>
          <TouchableOpacity onPress={() => setPhase("game")}>
            <Text style={styles.startButton}>¡Empezar!</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (phase === "completed") return <Text style={styles.completedText}>¡Actividad completada!</Text>;

  return (
    <View style={styles.container}>
      {renderTutorial()}
      {phase === "game" && (
        <>
          <View style={styles.shapeContainer}>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Svg height="100" width="100">{renderShape(currentShape)}</Svg>
            </PanGestureHandler>
          </View>
          {renderDropZones()}
        </>
      )}
    </View>
  );
};

ShapeSortingGame2.propTypes = {
  ageGroup: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  shapeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dropZoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  dropZone: {
    padding: 20,
    backgroundColor: '#add8e6',
    borderRadius: 5,
  },
  dropZoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tutorialContainer: {
    alignItems: 'center',
  },
  tutorialText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    fontSize: 20,
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 24,
    color: '#228b22',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ShapeSortingGame2;
