
import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HintButton = ({ hints, onUseHint, enabled }) => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const showHint = () => {
    if (!enabled || currentHintIndex >= hints.length) return;
    
    onUseHint(hints[currentHintIndex]);
    setCurrentHintIndex(prev => prev + 1);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        delay: 2000,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={showHint}
        disabled={!enabled || currentHintIndex >= hints.length}
      >
        <LinearGradient
          colors={['#FFB74D', '#FF9800']}
          style={[
            styles.button,
            (!enabled || currentHintIndex >= hints.length) && styles.disabled
          ]}
        >
          <Text style={styles.text}>
            {currentHintIndex >= hints.length ? 'No más pistas' : 'Pista'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 10,
  },
  button: {
    padding: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  }
});

export default HintButton;