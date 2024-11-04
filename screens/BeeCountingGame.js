import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { triggerHaptic } from '../services/haptics';
import SpriteSheet from 'react-native-sprite-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const BeeIcon = ({ color, size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
            d="M17.4 9C17 7.8 16.2 6.8 15.2 6C15.6 5.4 16 4.7 16 4C16 2.9 15.1 2 14 2C13.1 2 12.4 2.6 12 3.3C11.6 2.6 10.9 2 10 2C8.9 2 8 2.9 8 4C8 4.7 8.4 5.4 8.8 6C7.8 6.8 7 7.8 6.6 9H5V10H6.1C6 10.3 6 10.7 6 11V12H5V13H6V14H5V15H6V16C6 18.8 8.2 21 11 21H13C15.8 21 18 18.8 18 16V15H19V14H18V13H19V12H18V11C18 10.7 18 10.3 17.9 10H19V9H17.4M14 4C14.6 4 15 4.4 15 5S14.6 6 14 6 13 5.6 13 5 13.4 4 14 4M10 4C10.6 4 11 4.4 11 5S10.6 6 10 6 9 5.6 9 5 9.4 4 10 4M17 16C17 18.2 15.2 20 13 20H11C8.8 20 7 18.2 7 16V11C7 8.8 8.8 7 11 7H13C15.2 7 17 8.8 17 11V16Z"
            fill={color === 'yellow' ? '#FFD700' : '#4169E1'}
            stroke="#000"
            strokeWidth="0.5"
        />
    </Svg>
);

const BeeCountingGame = () => {
    const [gameMode, setGameMode] = useState(null); // 'simple' or 'grouping'
    const [level, setLevel] = useState(1);
    const [yellowBees, setYellowBees] = useState(0);
    const [blueBees, setBlueBees] = useState(0);
    const [groupedBees, setGroupedBees] = useState(0);
    const [remainingBees, setRemainingBees] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const spinValue = useRef(new Animated.Value(0)).current;

    // Configuración según nivel
    const gameLevels = {
        simple: {
            1: { yellow: 2, blue: 2 },
            2: { yellow: 3, blue: 3 },
            3: { yellow: 4, blue: 4 }
        },
        grouping: {
            1: { total: 12, groupSize: 3 },
            2: { total: 15, groupSize: 3 },
            3: { total: 20, groupSize: 3 }
        }
    };

    // Sonidos
    const sounds = {
        success: require('../assets/correct.mp3'),
        error: require('../assets/incorrect.mp3'),
    };

    // Modifica la configuración de audio
    const playSound = async (soundType) => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });
            const { sound } = await Audio.Sound.createAsync(sounds[soundType]);
            await sound.playAsync();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const AnimatedBee = ({ color, onPress, size = 80 }) => {
        const beeRef = useRef();
        const spinValue = useRef(new Animated.Value(0)).current;
        
        useEffect(() => {
            startBeeAnimation();
        }, []);

        const startBeeAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(spinValue, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true
                    }),
                    Animated.timing(spinValue, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true
                    })
                ])
            ).start();
        };

        const spin = spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        const handlePress = async () => {
            await triggerHaptic('medium');
            beeRef.current?.rubberBand(800);
            onPress();
        };

        return (
            <TouchableOpacity onPress={handlePress}>
                <Animatable.View
                    ref={beeRef}
                    style={styles.beeContainer}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <BeeIcon color={color} size={size} />
                    </Animated.View>
                </Animatable.View>
            </TouchableOpacity>
        );
    };

    const NumberGuide = ({ number }) => (
        <Animatable.View 
            animation="fadeIn" 
            style={styles.numberGuide}
        >
            {[...Array(number)].map((_, i) => (
                <View key={i} style={styles.dot} />
            ))}
        </Animatable.View>
    );

    const handleBeeCount = async (color) => {
        if (gameMode === 'simple') {
            const currentLevel = gameLevels.simple[level];
            if (color === 'yellow' && yellowBees < currentLevel.yellow) {
                setYellowBees(prev => prev + 1);
            } else if (color === 'blue' && blueBees < currentLevel.blue) {
                setBlueBees(prev => prev + 1);
            }

            // Verificar victoria
            if (yellowBees + 1 === currentLevel.yellow && 
                blueBees === currentLevel.blue ||
                yellowBees === currentLevel.yellow && 
                blueBees + 1 === currentLevel.blue) {
                celebrateSuccess();
            }
        }
    };

    const handleGrouping = () => {
        const currentLevel = gameLevels.grouping[level];
        const total = yellowBees + blueBees;
        const groups = Math.floor(total / currentLevel.groupSize);
        const remaining = total % currentLevel.groupSize;
        
        setGroupedBees(groups);
        setRemainingBees(remaining);

        if (total === currentLevel.total) {
            celebrateSuccess();
        }
    };

    const celebrateSuccess = async () => {
        await playSound('success');
        setShowCelebration(true);
        setTimeout(() => {
            setShowCelebration(false);
            if (level < 3) {
                setLevel(prev => prev + 1);
            }
        }, 3000);
    };

    const Celebration = () => {
        const particles = Array(20).fill(0);
        return (
            <View style={styles.celebrationContainer}>
                {particles.map((_, index) => (
                    <Animatable.View
                        key={index}
                        animation="zoomOut"
                        duration={1000}
                        delay={index * 100}
                        style={[
                            styles.particle,
                            {
                                left: Math.random() * 300,
                                top: Math.random() * 500,
                                backgroundColor: ['#FFD700', '#FFA500', '#FF69B4'][
                                    Math.floor(Math.random() * 3)
                                ],
                            },
                        ]}
                    />
                ))}
                <Animatable.Text
                    animation="bounceIn"
                    style={styles.celebrationText}
                >
                    ¡Excelente trabajo!
                </Animatable.Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {!gameMode ? (
                // Selector de modo de juego
                <View style={styles.modeSelector}>
                    <Text style={styles.title}>¡Elige tu juego!</Text>
                    <TouchableOpacity 
                        style={styles.modeButton}
                        onPress={() => setGameMode('simple')}
                    >
                        <Text style={styles.modeButtonText}>Contar Abejas</Text>
                        <Text style={styles.ageText}>4-6 años</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.modeButton}
                        onPress={() => setGameMode('grouping')}
                    >
                        <Text style={styles.modeButtonText}>Agrupar Abejas</Text>
                        <Text style={styles.ageText}>7-9 años</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Contenido del juego
                <>
                    <Text style={styles.level}>Nivel {level}</Text>
                    {gameMode === 'simple' ? (
                        // Modo simple
                        <SimpleCountingGame 
                            yellowBees={yellowBees}
                            blueBees={blueBees}
                            handleBeeCount={handleBeeCount}
                            currentLevel={gameLevels.simple[level]}
                            showHint={showHint}
                        />
                    ) : (
                        // Modo agrupación
                        <GroupingGame 
                            groupedBees={groupedBees}
                            remainingBees={remainingBees}
                            handleGrouping={handleGrouping}
                            currentLevel={gameLevels.grouping[level]}
                            showHint={showHint}
                        />
                    )}
                </>
            )}

            {/* Celebración */}
            <Modal visible={showCelebration} transparent>
                <Celebration />
            </Modal>

            {/* Botones de control */}
            <View style={styles.controlButtons}>
                <TouchableOpacity 
                    style={styles.hintButton}
                    onPress={() => setShowHint(!showHint)}
                >
                    <Text style={styles.buttonText}>Pista</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={() => setGameMode(null)}
                >
                    <Text style={styles.buttonText}>Menú Principal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const SimpleCountingGame = ({ yellowBees, blueBees, handleBeeCount, currentLevel, showHint }) => {
    return (
      <View style={styles.gameContainer}>
        <View style={styles.beesContainer}>
          <AnimatedBee color="yellow" onPress={() => handleBeeCount('yellow')} />
          <AnimatedBee color="blue" onPress={() => handleBeeCount('blue')} />
        </View>
        {showHint && (
          <NumberGuide number={Math.max(currentLevel.yellow, currentLevel.blue)} />
        )}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Abejas Amarillas: {yellowBees}/{currentLevel.yellow}
          </Text>
          <Text style={styles.progressText}>
            Abejas Azules: {blueBees}/{currentLevel.blue}
          </Text>
        </View>
      </View>
    );
  };
  
  const GroupingGame = ({ groupedBees, remainingBees, handleGrouping, currentLevel, showHint }) => {
    return (
      <View style={styles.gameContainer}>
        <View style={styles.beesContainer}>
          <AnimatedBee color="yellow" onPress={handleGrouping} />
        </View>
        {showHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Agrupa las abejas de {currentLevel.groupSize} en {currentLevel.groupSize}
            </Text>
          </View>
        )}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Grupos completados: {groupedBees}
          </Text>
          <Text style={styles.progressText}>
            Abejas restantes: {remainingBees}
          </Text>
        </View>
      </View>
    );
  };
  
  // Add error boundary
  class ErrorBoundary extends React.Component {
    state = { hasError: false };
  
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Algo salió mal. Por favor, reinicia el juego.
            </Text>
          </View>
        );
      }
      return this.props.children;
    }
  }
  
  // Wrap main component with ErrorBoundary
  export default function BeeCountingGameWrapper() {
    return (
      <ErrorBoundary>
        <BeeCountingGame />
      </ErrorBoundary>
    );
  }
  
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F0F8FF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#2E86C1',
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    progressText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginVertical: 5,
    },
    beeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 30,
    },
    bee: {
        width: 80,
        height: 80,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    groupButton: {
        backgroundColor: '#2ECC71',
    },
    resetButton: {
        backgroundColor: '#E74C3C',
    },
    backButton: {
        backgroundColor: '#3498DB',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    resultText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    congratsContainer: {
        backgroundColor: '#FEF9E7',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    congratsText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F1C40F',
    },
    modeSelector: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeButton: {
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 15,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    level: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#2E86C1',
    },
    numberGuide: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000',
        margin: 2,
    },
    celebrationModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    celebrationAnimation: {
        width: 200,
        height: 200,
    },
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    hintButton: {
        backgroundColor: '#3498DB',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    particle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    celebrationContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    beeContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
