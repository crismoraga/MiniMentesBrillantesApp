
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const TimeBar = ({ duration, onTimeUp }) => {
  const timeAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(timeAnim, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onTimeUp();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.fill, { width: timeAnim.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%']
        })}]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
});

export default TimeBar;