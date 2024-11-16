import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions,
  SafeAreaView,
  ImageBackground,
  FlatList,
  Vibration,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { FloatingAction } from 'react-native-floating-action';
import Carousel from 'react-native-snap-carousel';
import { useAppContext } from '../context/AppContext';
import { triggerHaptic } from '../services/haptics';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const MainGameScreen = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState('4-5');
  const { getColor, isSoundMuted, speakText, stopSpeak } = useAppContext();

  const games = [
    {
      id: 1,
      title: 'Clasificación de Formas',
      route: 'ShapeSortingGame',
      image: require('../assets/shapes.png'),
      colors: ['#FF9A9E', '#FAD0C4'],
      icon: '🔷',
      animation: 'bounceIn',
      description: 'Aprende a clasificar formas básicas',
      instructions: 'Aprende sobre las formas y colores. Sigue las instrucciones en cada etapa.',
    },
    {
      id: 2,
      title: 'Pizza Matemática',
      route: 'PizzaGame',
      image: require('../assets/pizza.png'),
      colors: ['#84FAB0', '#8FD3F4'],
      icon: '🍕',
      animation: 'zoomIn',
      description: 'Aprende fracciones con pizza',
      instructions: 'Aprende sobre las fracciones usando pizza. Sigue las instrucciones en cada etapa.',
    },
    {
      id: 3,
      title: 'Juego de las Abejas',
      route: 'BeeCountingGame',
      image: require('../assets/bee.png'),
      colors: ['#FFE985', '#FA742B'],
      icon: '🐝',
      animation: 'bounceInLeft',
      description: 'Conteo y agrupación',
      instructions: 'Aprende a contar y agrupar con abejas. Sigue las instrucciones en cada etapa.',
    },
    {
      id: 4,
      title: 'Trazado de Números',
      route: 'NumberTracingGame',
      image: require('../assets/123.png'),
      colors: ['#F6D365', '#FDA085'],
      icon: '✏️',
      animation: 'bounceInRight',
      description: 'Aprende a escribir números',
      instructions: 'Aprende a trazar números. Sigue las instrucciones en cada etapa.',
    },
    {
      id: 5,
      title: 'Memoriza Formas',
      route: 'MemorizeShapes',
      image: require('../assets/memorice.jpg'), // Asegúrate de tener esta imagen
      colors: ['#A8E6CF', '#DCEDC1'],
      icon: '🎯',
      animation: 'bounceIn',
      description: 'Encuentra pares de formas iguales',
      instructions: 'Encuentra pares de formas iguales. Sigue las instrucciones en cada etapa.',
    },
  ];

  const featuredGames = games.slice(0, 3); // Seleccionamos algunos juegos destacados

  const handlePlayGame = async (game) => {
    await stopSpeak(); // Evitar superposición
    await speakText(`Has seleccionado el juego ${game.title}. ${game.instructions}`);
    if (!isSoundMuted) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.warn('Error en haptic feedback:', error);
      }
    }
    navigation.navigate(game.route, { age: selectedAge });
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePlayGame(item)}
      onPressIn={() => speakText(item.title)}
      activeOpacity={0.8}
      style={styles.carouselItem}
    >
      <Image
        source={item.image}
        style={styles.carouselGameImage}
        resizeMode="contain"
      />
      <View style={styles.carouselTitleContainer}>
        <Text style={styles.carouselGameTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor('background') }]}>
      <View style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <Text style={styles.footer}>Edad: {selectedAge} años</Text>
          </Animatable.View>

          <View style={styles.carouselContainer}>
            <Text style={[styles.sectionTitle, { color: getColor('primary') }]}>Juegos Destacados</Text>
            <Carousel
              data={featuredGames}
              renderItem={renderCarouselItem}
              sliderWidth={width}
              itemWidth={width * 0.7}
              loop={true}
              useScrollView={true}
              autoplay={true}
              autoplayInterval={3000}
            />
          </View>

          <View style={styles.gamesGrid}>
            <Text style={[styles.sectionTitle, { color: getColor('primary') }]}>Todos los Juegos</Text>
            {games.map((game, index) => (
              <Animatable.View
                key={game.id}
                animation="bounceIn"
                delay={index * 100}
                style={styles.gameCard}
              >
                <TouchableOpacity
                  onPress={() => handlePlayGame(game)}
                  activeOpacity={0.8}
                >
                    <Image
                      source={game.image}
                      style={styles.gameImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>
                      {game.description}
                    </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  carouselContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#FF6F61',
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 20,
    marginBottom: 10,
  },
  carouselItem: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  carouselGameImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  carouselTitleContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  carouselGameTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gamesGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
    flexDirection: 'row',
  },
  gameCard: {
    width: width * 0.43,
    margin: 8,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardBackground: {
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
  gameImage: {
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  gameTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFF',
  },
});

export default MainGameScreen;
