import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import ParticlesBg from 'react-native-particles-bg';
import AnimatedDots from 'react-native-animated-dots';
import AnimatedBackground from 'react-native-animated-background';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { width, height } = Dimensions.get('window');

const GameScreen = ({ navigation }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize games array
  const games = React.useMemo(() => [
    { 
      title: 'Clasificación de Formas 1', 
      route: 'ShapeSortingGame',
      colors: ['#FF9A9E', '#FAD0C4'],
      animation: 'bounceIn',
      icon: '🔷'
    },
    { 
      title: 'Clasificación de Formas 2', 
      route: 'ShapeSortingGame2',
      colors: ['#A18CD1', '#FBC2EB'],
      animation: 'fadeInLeft',
      icon: '🔶'
    },
    { 
      title: 'Clasificación de Formas 3', 
      route: 'ShapeSortingGame3',
      colors: ['#FDCBF1', '#E6DEE9'],
      animation: 'fadeInRight',
      icon: '📐'
    },
    { 
      title: 'Juego de Pizza', 
      route: 'PizzaGame',
      colors: ['#84FAB0', '#8FD3F4'],
      animation: 'fadeInRight',
      icon: '🍕'
    },
    { 
      title: 'Trazado de Números', 
      route: 'NumberTracingGame',
      colors: ['#F6D365', '#FDA085'],
      animation: 'bounceInLeft',
      icon: '✏️'
    },
    { 
      title: 'Juego de las Abejas', 
      route: 'BeeCountingGame',
      colors: ['#FFE985', '#FA742B'],
      animation: 'bounceInRight',
      icon: '🐝'
    }
  ], []);

  // Optimized navigation handler
  const handleGameSelection = useCallback((game) => {
    try {
      setSelectedGame(game.route);
      setIsLoading(true);
      setTimeout(() => {
        navigation.navigate(game.route);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsLoading(false);
      // Mostrar mensaje de error al usuario
      Alert.alert('Error', 'No se pudo cargar el juego. Inténtalo de nuevo.');
    }
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedGame(null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [navigation]);

  // Add loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const floatingAnimation = {
    0: { transform: [{ translateY: 0 }] },
    0.5: { transform: [{ translateY: -10 }] },
    1: { transform: [{ translateY: 0 }] }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.Text 
            animation="pulse" 
            iterationCount="infinite" 
            style={styles.title}
          >
            Elige un Juego
            <AnimatedDots animationType="bounce" />
          </Animatable.Text>

          <View style={styles.gamesGrid}>
            {games.map((game, index) => (
              <Animatable.View
                key={index}
                animation={game.animation}
                delay={index * 200}
                duration={1500}
                style={styles.gameWrapper}
              >
                <TouchableOpacity
                  onPress={() => !isLoading && handleGameSelection(game)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Animatable.View
                    animation={selectedGame === game.route ? 'bounce' : undefined}
                  >
                    <LinearGradient
                      colors={game.colors}
                      style={[
                        styles.gameButton,
                        selectedGame === game.route && styles.selectedGame
                      ]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                    >
                      <Animatable.Text
                        animation={floatingAnimation}
                        iterationCount="infinite"
                        duration={2000}
                        style={styles.gameIcon}
                      >
                        {game.icon}
                      </Animatable.Text>
                      <Animatable.Text
                        style={styles.buttonText}
                        animation="pulse"
                        iterationCount="infinite"
                        duration={2000}
                      >
                        {game.title}
                      </Animatable.Text>
                      <ShimmerPlaceholder
                        style={styles.shimmer}
                        duration={2000}
                      />
                    </LinearGradient>
                  </Animatable.View>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gameWrapper: {
    width: width * 0.43,
    margin: 8,
  },
  gameButton: {
    padding: 15,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGame: {
    transform: [{scale: 0.95}],
    borderColor: '#fff',
    borderWidth: 3,
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  shimmer: {
    width: '80%',
    height: 2,
    borderRadius: 3,
    marginTop: 8,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});

export default GameScreen;
