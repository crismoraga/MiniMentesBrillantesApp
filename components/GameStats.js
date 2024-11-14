
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const GameStats = ({ score, streak, multiplier }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Puntuación</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Racha</Text>
        <Text style={styles.value}>{streak}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Multiplicador</Text>
        <Text style={styles.value}>x{multiplier.toFixed(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    margin: 10,
  },
  stat: {
    alignItems: 'center',
  },
  label: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  value: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameStats;