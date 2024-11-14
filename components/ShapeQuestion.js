
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ShapeQuestion = ({ shape, options, onAnswer, difficulty }) => {
  return (
    <View style={styles.container}>
      <Animated.Image 
        source={shape.image}
        style={[styles.image, {
          transform: [{
            scale: new Animated.Value(1)
          }]
        }]}
      />
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onAnswer(option.id === shape.id)}
            style={[styles.option, { opacity: difficulty === 'Difícil' ? 0.8 : 1 }]}
          >
            <LinearGradient
              colors={option.gradient}
              style={styles.optionGradient}
            >
              <Text style={styles.optionText}>{option.type}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  optionsContainer: {
    width: '100%',
  },
  option: {
    marginVertical: 8,
  },
  optionGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ShapeQuestion;