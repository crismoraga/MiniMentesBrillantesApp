
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const ProgressIndicator = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.progress,
            { width: `${progress}%` }
          ]} 
        />
      </View>
      <View style={styles.dots}>
        {Array(total).fill(0).map((_, i) => (
          <View 
            key={i}
            style={[
              styles.dot,
              i < current && styles.activeDot
            ]}
          />
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
  track: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4ECDC4',
  },
});

export default ProgressIndicator;