import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Dimensions, TextInput, Animated } from 'react-native';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const FloatingBee = ({ color }) => {
  const [position] = useState({
    x: new Animated.Value(Math.random() * SCREEN_WIDTH),
    y: new Animated.Value(Math.random() * SCREEN_HEIGHT * 0.6)
  });

  useEffect(() => {
    const animatePosition = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(position.x, {
            toValue: Math.random() * SCREEN_WIDTH,
            duration: 3000,
            useNativeDriver: true
          }),
          Animated.timing(position.x, {
            toValue: Math.random() * SCREEN_WIDTH,
            duration: 3000,
            useNativeDriver: true
          })
        ]),
        Animated.sequence([
          Animated.timing(position.y, {
            toValue: Math.random() * SCREEN_HEIGHT * 0.6,
            duration: 3000,
            useNativeDriver: true
          }),
          Animated.timing(position.y, {
            toValue: Math.random() * SCREEN_HEIGHT * 0.6,
            duration: 3000,
            useNativeDriver: true
          })
        ])
      ]).start(() => animatePosition());
    };

    animatePosition();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      transform: [
        { translateX: position.x },
        { translateY: position.y }
      ]
    }}>
      <Image 
        source={require('../assets/bee.png')} 
        style={[styles.bee, { tintColor: color }]}
      />
    </Animated.View>
  );
};

const SimpleBee = ({ color, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
            <Image 
                source={require('../assets/bee.png')} 
                style={[
                    styles.bee,
                    { tintColor: color === 'yellow' ? '#FFD700' : '#4169E1' }
                ]} 
            />
        </Animatable.View>
    </TouchableOpacity>
);

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

const BeeCountingGame = () => {
    const navigation = useNavigation();
    const [age, setAge] = useState(null);
    const [level, setLevel] = useState(1);
    const [yellowBees, setYellowBees] = useState(0);
    const [blueBees, setBlueBees] = useState(0);
    const [groupedBees, setGroupedBees] = useState(0);
    const [remainingBees, setRemainingBees] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [stage, setStage] = useState(1);
    const [answer, setAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [currentColor, setCurrentColor] = useState(0); // Index of current color being asked
    const [isFinalCount, setIsFinalCount] = useState(false);
    const [totalBees, setTotalBees] = useState(0);

    useEffect(() => {
        const loadAge = async () => {
            try {
                const storedAge = await AsyncStorage.getItem('userAge');
                if (storedAge) {
                    setAge(parseInt(storedAge));
                }
            } catch (error) {
                console.error('Error loading age:', error);
            }
        };
        loadAge();
    }, []);

    // Determine game mode based on age
    const gameMode = age && age >= 7 ? 'grouping' : 'simple';

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

    const generateStageConfig = (colorCount) => {
        let colors = [
            { hex: '#FFD700', name: 'amarillas' },
            { hex: '#4169E1', name: 'azules' },
            { hex: '#32CD32', name: 'verdes' },
            { hex: '#FF0000', name: 'rojas' },
            { hex: '#800080', name: 'moradas' }
        ].slice(0, colorCount);

        let remainingBees = 10;
        let configuredColors = colors.map((color, index) => {
            if (index === colors.length - 1) {
                // Last color gets remaining bees (if any)
                const count = Math.min(remainingBees, Math.floor(Math.random() * 3) + 1);
                remainingBees -= count;
                return { ...color, count };
            } else {
                // Random 1-3 bees per color
                const maxPossible = Math.min(3, remainingBees);
                const count = Math.max(1, Math.min(maxPossible, Math.floor(Math.random() * 3) + 1));
                remainingBees -= count;
                return { ...color, count };
            }
        });

        return configuredColors;
    };

    const [stageConfig, setStageConfig] = useState({
        1: { colors: generateStageConfig(2) },
        2: { colors: generateStageConfig(3) },
        3: { colors: generateStageConfig(4) },
        4: { colors: generateStageConfig(5) }
    });

    useEffect(() => {
        const total = stageConfig[stage].colors.reduce((sum, color) => sum + color.count, 0);
        setTotalBees(total);
    }, [stage]);

    // Sonidos
    const sounds = {
        success: require('../assets/correct.mp3'),
        error: require('../assets/incorrect.mp3'),
    };

    // Modifica la configuración de audio
    const playSound = async (soundType) => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                sounds[soundType],
                { shouldPlay: true }
            );
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sound.unloadAsync();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

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
        setNotificationMessage('¡Excelente trabajo!');
        setShowNotification(true);
        setTimeout(() => {
            setShowCelebration(false);
            setShowNotification(false);
            if (level < 3) {
                setLevel(prev => prev + 1);
                setYellowBees(0);
                setBlueBees(0);
                setGroupedBees(0);
                setRemainingBees(0);
            }
        }, 3000);
    };

    const checkAnswer = async () => {
        if (isFinalCount) {
            if (parseInt(answer) === totalBees) {
                await playSound('success');
                setShowCelebration(true);
                setTimeout(() => {
                    setShowCelebration(false);
                    navigation.navigate('MainGameScreen');
                }, 2000);
            } else {
                await playSound('error');
            }
            setAnswer('');
            return;
        }

        const currentConfig = stageConfig[stage];
        const currentColorConfig = currentConfig.colors[currentColor];
        
        if (parseInt(answer) === currentColorConfig.count) {
            await playSound('success');
            
            if (currentColor + 1 < currentConfig.colors.length) {
                setCurrentColor(currentColor + 1);
            } else {
                if (stage < 4) {
                    setShowCelebration(true);
                    setTimeout(() => {
                        setShowCelebration(false);
                        setStage(prev => prev + 1);
                        setCurrentColor(0);
                        setScore(score + 1);
                    }, 2000);
                } else {
                    setIsFinalCount(true);
                }
            }
        } else {
            await playSound('error');
        }
        setAnswer('');
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
            <Text style={styles.level}>Etapa {stage}</Text>
            <Text style={styles.score}>Puntuación: {score}</Text>
            
            <View style={styles.gameArea}>
                {stageConfig[stage].colors.map((colorConfig, index) => (
                    Array(colorConfig.count).fill(0).map((_, beeIndex) => (
                        <FloatingBee 
                            key={`${index}-${beeIndex}`}
                            color={colorConfig.hex}
                        />
                    ))
                ))}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.questionText}>
                    {isFinalCount 
                        ? '¿Cuántas abejas hay en total?'
                        : `¿Cuántas abejas ${stageConfig[stage].colors[currentColor].name} ves?`
                    }
                </Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder="Ingresa el número"
                    placeholderTextColor="#666"
                />
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={checkAnswer}
                >
                    <Text style={styles.buttonText}>
                        {isFinalCount ? 'Finalizar Juego' : 'Comprobar'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Celebración */}
            <Modal visible={showCelebration} transparent>
                <Celebration />
            </Modal>

            {/* Notificación personalizada */}
            <Modal transparent={true} visible={showNotification} animationType="fade">
                <View style={styles.notificationContainer}>
                    <Animatable.View
                        animation="fadeInDown"
                        duration={800}
                        style={styles.notification}
                    >
                        <Animatable.View 
                            animation="pulse" 
                            iterationCount="infinite" 
                            style={styles.successIcon}
                        >
                            <Text style={styles.successEmoji}>✨</Text>
                        </Animatable.View>
                        <Text style={styles.notificationText}>{notificationMessage}</Text>
                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
};

const SimpleCountingGame = ({ yellowBees, blueBees, handleBeeCount, currentLevel, showHint }) => {
    return (
        <View style={styles.gameContainer}>
            <View style={styles.beesContainer}>
                <SimpleBee color="yellow" onPress={() => handleBeeCount('yellow')} />
                <SimpleBee color="blue" onPress={() => handleBeeCount('blue')} />
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
                <SimpleBee color="yellow" onPress={handleGrouping} />
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

export default BeeCountingGame;

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
        width: 40,
        height: 40,
        resizeMode: 'contain'
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
    notificationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    notification: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
    },
    notificationText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: 10,
    },
    successIcon: {
        marginBottom: 15,
    },
    successEmoji: {
        fontSize: 50,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
    },
    inputContainer: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#2ECC71',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2E86C1',
        marginBottom: 10,
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#2C3E50',
    },
});
