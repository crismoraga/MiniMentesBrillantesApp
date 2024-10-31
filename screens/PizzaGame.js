import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, PanResponder } from 'react-native';
import Svg, { Circle, Rect, Polygon, Line } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';

const PizzaGame = ({ ageGroup }) => {
  const [phase, setPhase] = useState('addingIngredients');
  const [targetIngredients, setTargetIngredients] = useState(Math.floor(Math.random() * (ageGroup === "4-5" ? 8 : 18)) + 3);
  const [ingredientsPlaced, setIngredientsPlaced] = useState([]);
  const [cutLines, setCutLines] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [draggingPosition, setDraggingPosition] = useState(null);
  const [targetSlices, setTargetSlices] = useState(Math.floor(Math.random() * 4) * 2 + 2);
  
  // Líneas pre-marcadas para guiar el corte
  const guideLines = Array.from({ length: targetSlices }, (_, i) => {
    const angle = (360 / targetSlices) * i;
    const radian = (Math.PI / 180) * angle;
    return {
      x: 50 + 50 * Math.cos(radian),
      y: 50 + 50 * Math.sin(radian),
    };
  });

  const handlePlaceIngredient = (x, y) => {
    if (ingredientsPlaced.length < targetIngredients) {
      setIngredientsPlaced([...ingredientsPlaced, { type: currentIngredient, x, y }]);
      setDraggingPosition(null);
      if (ingredientsPlaced.length + 1 >= targetIngredients) {
        setPhase('cutting');
      }
    }
  };

  const handleGesture = ({ nativeEvent }) => {
    if (phase === 'cutting' && cutLines.length < targetSlices) {
      const { x, y } = nativeEvent;
      // Verificar si el trazo del dedo sigue una línea predefinida
      const lineToFollow = guideLines[cutLines.length];
      const distance = Math.sqrt((x - lineToFollow.x) ** 2 + (y - lineToFollow.y) ** 2);
      if (distance < 10) { // margen de error
        setCutLines([...cutLines, { x, y }]);
      }
      if (cutLines.length >= targetSlices - 1) {
        setPhase('completed');
        Alert.alert("¡Juego completo!", "Has hecho los cortes correctamente.");
      }
    }
  };

  const renderIngredient = (ingredient) => {
    switch (ingredient.type) {
      case 'pepperoni':
        return <Circle cx={ingredient.x} cy={ingredient.y} r="5" fill="red" />;
      case 'cheese':
        return <Rect x={ingredient.x - 5} y={ingredient.y - 5} width="10" height="10" fill="yellow" />;
      case 'pineapple':
        return <Polygon points={`${ingredient.x},${ingredient.y - 5} ${ingredient.x + 5},${ingredient.y + 5} ${ingredient.x - 5},${ingredient.y + 5}`} fill="green" />;
      default:
        return null;
    }
  };

  const renderPizza = () => (
    <Svg height="200" width="200" viewBox="0 0 100 100" style={styles.pizza}>
      <Circle cx="50" cy="50" r="50" fill="#FFD700" />
      {ingredientsPlaced.map((ingredient, index) => (
        <React.Fragment key={index}>{renderIngredient(ingredient)}</React.Fragment>
      ))}
      {guideLines.map((line, index) => (
        <Line key={index} x1="50" y1="50" x2={line.x} y2={line.y} stroke="gray" strokeWidth="0.5" strokeDasharray="4 2" />
      ))}
      {cutLines.map((line, index) => (
        <Line key={index} x1="50" y1="50" x2={line.x} y2={line.y} stroke="black" strokeWidth="1" />
      ))}
    </Svg>
  );

  const renderDraggingIngredient = () => {
    if (!draggingPosition || !currentIngredient) return null;
    const { x, y } = draggingPosition;
    return (
      <Svg height="100" width="100" style={{ position: 'absolute', top: y - 25, left: x - 25 }}>
        {renderIngredient({ type: currentIngredient, x: 25, y: 25 })}
      </Svg>
    );
  };

  const ingredientPanResponder = (ingredient) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setCurrentIngredient(ingredient),
      onPanResponderMove: (evt, gestureState) => {
        setDraggingPosition({ x: gestureState.moveX, y: gestureState.moveY });
      },
      onPanResponderRelease: (evt, gestureState) => {
        handlePlaceIngredient(gestureState.moveX - 50, gestureState.moveY - 200); // Relative to pizza container
        setCurrentIngredient(null);
      },
    });

  const renderIngredientsOptions = () => (
    <View style={styles.ingredientsContainer}>
      {['pepperoni', 'cheese', 'pineapple'].map((ingredient, index) => (
        <View
          key={index}
          style={[styles.ingredientButton, styles[ingredient]]}
          {...ingredientPanResponder(ingredient).panHandlers}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pizza de Ingredientes</Text>
      {phase === 'addingIngredients' && <Text style={styles.instruction}>Coloca {targetIngredients} ingredientes en la pizza</Text>}
      {phase === 'cutting' && <Text style={styles.instruction}>Haz {targetSlices} cortes para dividir la pizza</Text>}
      <PanGestureHandler onGestureEvent={handleGesture}>
        <View style={styles.pizzaContainer}>{renderPizza()}</View>
      </PanGestureHandler>
      {renderDraggingIngredient()}
      {phase === 'addingIngredients' && renderIngredientsOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFAE5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8B4513',
  },
  instruction: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  pizzaContainer: {
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pizza: {
    marginBottom: 20,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  ingredientButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  pepperoni: {
    backgroundColor: 'red',
  },
  cheese: {
    backgroundColor: 'yellow',
  },
  pineapple: {
    backgroundColor: 'green',
  },
});

export default PizzaGame;
