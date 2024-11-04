import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, PanResponder, Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const PizzaGame = ({ ageGroup, navigation }) => {
  // State variables
  const [gameState, setGameState] = useState({
    phase: 'addingIngredients',
    targetIngredients:
      ageGroup === '4-5'
        ? Math.floor(Math.random() * 3) + 3 // 3 to 5 ingredients
        : Math.floor(Math.random() * 5) + 6, // 6 to 10 ingredients
    ingredientsPlaced: [],
    targetSlices: ageGroup === '4-5' ? 4 : 8, // 4 or 8 slices
  });

  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [draggingPosition, setDraggingPosition] = useState(null);
  const [cutLines, setCutLines] = useState([]);
  const [currentCutLine, setCurrentCutLine] = useState([]);
  const [expectedCuts, setExpectedCuts] = useState(generateExpectedCuts());

  const ingredientScale = useRef(new Animated.Value(1)).current;

  // Sound playback function
  const playSound = async (soundFile) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Cannot play the sound file', error);
    }
  };

  // Place ingredient on pizza
  const handlePlaceIngredient = async (x, y) => {
    if (gameState.ingredientsPlaced.length < gameState.targetIngredients) {
      const newIngredient = {
        id: Date.now() + Math.random(),
        type: currentIngredient,
        x,
        y,
      };
      const newIngredients = [...gameState.ingredientsPlaced, newIngredient];
      setGameState({
        ...gameState,
        ingredientsPlaced: newIngredients,
      });
      setDraggingPosition(null);

      // Animate ingredient
      Animated.sequence([
        Animated.timing(ingredientScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ingredientScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (newIngredients.length >= gameState.targetIngredients) {
        Alert.alert('¡Buen trabajo!', 'Ahora corta la pizza en porciones.');
        setGameState({ ...gameState, phase: 'cutting' });
      }
    }
  };

  // Function to generate expected straight cut lines
  function generateExpectedCuts() {
    const cuts = [];
    const center = { x: 150, y: 150 };
    const numberOfCuts = ageGroup === '4-5' ? 4 : 8;
    for (let i = 0; i < numberOfCuts; i++) {
      const angle = (i * 360) / numberOfCuts;
      const radians = (angle * Math.PI) / 180;
      const endX = center.x + 150 * Math.cos(radians);
      const endY = center.y + 150 * Math.sin(radians);
      cuts.push({ start: center, end: { x: endX, y: endY } });
    }
    return cuts;
  }

  // Handle cutting gesture
  const onCutGestureEvent = ({ nativeEvent }) => {
    if (gameState.phase === 'cutting') {
      const { x, y } = nativeEvent;
      setCurrentCutLine([{ x: 150, y: 150 }, { x, y }]); // Start from center
    }
  };

  // Handle end of cutting gesture
  const onCutHandlerStateChange = async ({ nativeEvent }) => {
    if (nativeEvent.state === State.END && gameState.phase === 'cutting') {
      if (currentCutLine.length === 2) {
        const userCut = currentCutLine;
        const isValidCut = expectedCuts.some(
          (cut) =>
            Math.abs(userCut[1].x - cut.end.x) < 20 &&
            Math.abs(userCut[1].y - cut.end.y) < 20
        );
        if (isValidCut) {
          setCutLines((prev) => [...prev, userCut]);
          if (cutLines.length + 1 >= gameState.targetSlices) {
            setGameState({ ...gameState, phase: 'completed' });
            Alert.alert(
              '¡Juego completo!',
              'Has cortado la pizza correctamente.',
              [{ text: 'OK', onPress: () => navigation.navigate('MainGameScreen') }]
            );
          }
        } else {
          Alert.alert('Corte inválido', 'Por favor, sigue la línea de puntos.');
        }
        setCurrentCutLine([]);
      } else {
        setCurrentCutLine([]);
      }
    }
  };

  // Ingredient icons definition
  const ingredientIcons = {
    Ají: { name: 'pepper-hot', color: '#27AE60' },
    Tocino: { name: 'bacon', color: '#E74C3C' },
    Queso: { name: 'cheese', color: '#F1C40F' },
    Aceituna: { name: 'circle', color: '#2C3E50' },
  };

  // Available ingredients based on age group
  const availableIngredients = ageGroup === '4-5'
    ? ['Tocino', 'Queso', 'Aceituna']
    : ['Tocino', 'Queso', 'Aceituna', 'Ají'];

  // Render ingredient on pizza
  const renderIngredient = (ingredient) => (
    <Animated.View
      key={ingredient.id}
      style={{
        position: 'absolute',
        left: ingredient.x - 15,
        top: ingredient.y - 15,
        transform: [{ scale: ingredientScale }],
      }}
    >
      <FontAwesome5
        name={ingredientIcons[ingredient.type].name}
        size={30}
        color={ingredientIcons[ingredient.type].color}
      />
    </Animated.View>
  );

  // Render expected cut lines
  const renderExpectedCuts = () => (
    <>
      {expectedCuts.map((cut, index) => (
        <Path
          key={`expected-cut-${index}`}
          d={`M${cut.start.x},${cut.start.y} L${cut.end.x},${cut.end.y}`}
          stroke="#95A5A6"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      ))}
    </>
  );

  // Render pizza with ingredients and cut lines
  const renderPizza = () => (
    <View style={styles.pizzaContainer}>
      <Svg height="300" width="300">
        {/* Pizza base */}
        <Circle cx="150" cy="150" r="150" fill="#F5CBA7" stroke="#D35400" strokeWidth="4" />
        {/* Placed ingredients */}
        {gameState.ingredientsPlaced.map(renderIngredient)}
        {/* Expected cut lines */}
        {gameState.phase === 'cutting' && renderExpectedCuts()}
        {/* Cut lines */}
        {cutLines.map((line, index) => (
          <Path
            key={`cut-line-${index}`}
            d={`M${line.map((p) => `${p.x},${p.y}`).join(' ')}`}
            stroke="#34495E"
            strokeWidth="2"
          />
        ))}
        {/* Current cutting line */}
        {currentCutLine.length === 2 && (
          <Path
            d={`M${currentCutLine.map((p) => `${p.x},${p.y}`).join(' ')}`}
            stroke="#E74C3C"
            strokeWidth="2"
          />
        )}
      </Svg>
    </View>
  );

  // Pan responder for ingredients
  const ingredientPanResponder = (ingredient) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setCurrentIngredient(ingredient),
      onPanResponderMove: (evt, gestureState) => {
        setDraggingPosition({
          x: gestureState.moveX - 25,
          y: gestureState.moveY - 25,
        });
      },
      onPanResponderRelease: () => {
        if (draggingPosition) {
          // Calculate position relative to pizza
          const pizzaPosition = { x: 50, y: 200 }; // Adjust as needed
          handlePlaceIngredient(
            draggingPosition.x - pizzaPosition.x,
            draggingPosition.y - pizzaPosition.y
          );
          setCurrentIngredient(null);
          setDraggingPosition(null);
        }
      },
    });

  // Render ingredient options for selection
  const renderIngredientsOptions = () => (
    <View style={styles.ingredientsContainer}>
      {availableIngredients.map((ingredient) => (
        <View
          key={ingredient}
          style={styles.ingredientOption}
          {...ingredientPanResponder(ingredient).panHandlers}
        >
          <FontAwesome5
            name={ingredientIcons[ingredient].name}
            size={50}
            color={ingredientIcons[ingredient].color}
          />
          <Text style={styles.ingredientLabel}>
            {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
          </Text>
        </View>
      ))}
    </View>
  );

  // Render the dragging ingredient
  const renderDraggingIngredient = () => {
    if (!draggingPosition || !currentIngredient) return null;
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left: draggingPosition.x - 15,
          top: draggingPosition.y - 15,
          transform: [{ scale: ingredientScale }],
        }}
      >
        <FontAwesome5
          name={ingredientIcons[currentIngredient].name}
          size={30}
          color={ingredientIcons[currentIngredient].color}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pizza de Ingredientes</Text>
      {gameState.phase === 'addingIngredients' && (
        <Text style={styles.instruction}>
          Coloca {gameState.targetIngredients} ingredientes en la pizza (
          {gameState.ingredientsPlaced.length}/{gameState.targetIngredients})
        </Text>
      )}
      {gameState.phase === 'cutting' && (
        <Text style={styles.instruction}>
          Haz {gameState.targetSlices} cortes para dividir la pizza (
          {cutLines.length}/{gameState.targetSlices})
        </Text>
      )}
      {/* Render pizza with or without cutting gesture handler */}
      {gameState.phase === 'cutting' ? (
        <PanGestureHandler
          onGestureEvent={onCutGestureEvent}
          onHandlerStateChange={onCutHandlerStateChange}
        >
          {renderPizza()}
        </PanGestureHandler>
      ) : (
        renderPizza()
      )}
      {/* Render the dragging ingredient */}
      {renderDraggingIngredient()}
      {/* Render ingredient options */}
      {gameState.phase === 'addingIngredients' && renderIngredientsOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF3CF',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 20,
    color: '#34495E',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pizzaContainer: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 10,
  },
  ingredientOption: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  ingredientLabel: {
    marginTop: 5,
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default PizzaGame;
