import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions,
  SafeAreaView 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import ConfettiCannon from 'react-native-confetti-cannon';
import { FloatingAction } from 'react-native-floating-action';

const { width, height } = Dimensions.get('window');

const MainGameScreen = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState('4-5');
  const [showConfetti, setShowConfetti] = useState(false);

  const games = [
    {
      id: 1,
      title: 'Clasificación de Formas 1',
      route: 'ShapeSortingGame',
      image: require('../assets/shapes.png'),
      colors: ['#FF9A9E', '#FAD0C4'],
      icon: '🔷',
      animation: 'bounceIn',
      description: 'Aprende a clasificar formas básicas'
    },
    {
      id: 2,
      title: 'Clasificación de Formas 2',
      route: 'ShapeSortingGame2',
      image: require('../assets/shapes1.png'),
      colors: ['#A18CD1', '#FBC2EB'],
      icon: '🔶',
      animation: 'fadeInLeft',
      description: 'Formas más avanzadas'
    },
    {
      id: 3,
      title: 'Clasificación de Formas 3',
      route: 'ShapeSortingGame3',
      image: require('../assets/shapes3.png'),
      colors: ['#FDCBF1', '#E6DEE9'],
      icon: '📐',
      animation: 'fadeInRight',
      description: 'Experto en formas'
    },
    {
      id: 4,
      title: 'Pizza Matemática',
      route: 'PizzaGame',
      image: require('../assets/pizza.png'),
      colors: ['#84FAB0', '#8FD3F4'],
      icon: '🍕',
      animation: 'zoomIn',
      description: 'Aprende fracciones con pizza'
    },
    {
      id: 5,
      title: 'Juego de las Abejas',
      route: 'BeeCountingGame',
      image: require('../assets/bee.png'),
      colors: ['#FFE985', '#FA742B'],
      icon: '🐝',
      animation: 'bounceInLeft',
      description: 'Conteo y agrupación'
    },
    {
      id: 6,
      title: 'Trazado de Números',
      route: 'NumberTracingGame',
      image: require('../assets/123.png'),
      colors: ['#F6D365', '#FDA085'],
      icon: '✏️',
      animation: 'bounceInRight',
      description: 'Aprende a escribir números'
    }
  ];

  const handlePlayGame = (game) => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      navigation.navigate(game.route, { age: selectedAge });
    }, 1000);
  };

  const actions = [
    {
      text: "4-5 años",
      name: "4-5",
      color: "#FF9A9E"
    },
    {
      text: "5-6 años",
      name: "5-6",
      color: "#A18CD1"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animatable.View animation="fadeIn" style={styles.header}>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite" 
              style={styles.headerTitle}
            >
              Juegos Educativos
            </Animatable.Text>
            <Text style={styles.headerSubtitle}>
              Edad: {selectedAge} años
            </Text>
          </Animatable.View>

          <View style={styles.gamesGrid}>
            {games.map((game, index) => (
              <Animatable.View
                key={game.id}
                animation={game.animation}
                delay={index * 200}
                style={styles.gameCard}
              >
                <TouchableOpacity
                  onPress={() => handlePlayGame(game)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardGradient, { backgroundColor: game.colors[0] }]}>
                    <Image
                      source={game.image}
                      style={styles.gameImage}
                      resizeMode="cover"
                    />
                    <Animatable.Text
                      animation="pulse"
                      iterationCount="infinite"
                      style={styles.gameIcon}
                    >
                      {game.icon}
                    </Animatable.Text>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>
                      {game.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </ScrollView>

        {showConfetti && (
          <ConfettiCannon
            count={50}
            origin={{x: width/2, y: height}}
            autoStart={true}
            fadeOut={true}
          />
        )}

        <FloatingAction
          actions={actions}
          onPressItem={name => setSelectedAge(name)}
          color="#4CAF50"
          overlayColor="rgba(68, 68, 68, 0.7)"
          position="right"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  background: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  header: {
    height: 200,
    width: '100%',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  gameCard: {
    width: width * 0.45,
    margin: 8,
    borderRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardGradient: {
    borderRadius: 15,
    padding: 15,
    height: height * 0.25,
    justifyContent: 'space-between',
  },
  gameImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  gameIcon: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 5,
  },
  gameTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  gameDescription: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  }
});

export default MainGameScreen;
