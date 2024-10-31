import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Switch } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const Cloud = ({ initialPosition, speed, opacity, top }) => {
  const cloudPosition = useSharedValue(initialPosition);

  useEffect(() => {
    cloudPosition.value = withRepeat(
      withTiming(300, { duration: speed, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  const cloudStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudPosition.value }],
    opacity: opacity,
  }));

  return (
    <Animated.Image
      source={require('../assets/cloud.png')}
      style={[styles.cloud, cloudStyle, { top: top, tintColor: 'white' }]}
    />
  );
};

export default function HomeScreen({ navigation }) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isMusicMuted, setMusicMuted] = useState(false);
  const [isSoundMuted, setSoundMuted] = useState(false);
  const [isColorBlindMode, setColorBlindMode] = useState(false);

  return (
    <View style={styles.container}>
      {/* Animated Clouds */}
      <Cloud initialPosition={-300} speed={5000} opacity={0.6} top={100} />
      <Cloud initialPosition={-500} speed={7000} opacity={0.8} top={200} />
      <Cloud initialPosition={-700} speed={6000} opacity={0.5} top={150} />
      <Cloud initialPosition={-900} speed={8000} opacity={0.7} top={250} />
      <Cloud initialPosition={-1100} speed={5500} opacity={0.9} top={50} />

      <Text style={styles.versionText}>Ver 1.0</Text>
      
      {/* Settings Button */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
        <Image source={require('../assets/Settings-PNG-Free-Download.png')} style={styles.settingsIcon} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Mini Mentes</Text>
        <Text style={styles.subtitleText}>Brillantes</Text>
      </View>
      
      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.startButtonText}>¡Iniciar!</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        transparent={true}
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ajustes</Text>

            <View style={styles.settingOption}>
              <Text style={styles.settingText}>Silenciar Música</Text>
              <Switch value={isMusicMuted} onValueChange={setMusicMuted} />
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.settingText}>Silenciar Sonidos</Text>
              <Switch value={isSoundMuted} onValueChange={setSoundMuted} />
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.settingText}>Modo Daltonismo</Text>
              <Switch value={isColorBlindMode} onValueChange={setColorBlindMode} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSettingsVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // Light blue to simulate sky
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 16,
    color: '#333',
  },
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  titleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color
    textShadowColor: '#FFA500', // Orange shadow
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 36,
    color: '#FFD700',
    textShadowColor: '#FFA500',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 3,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  startButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  cloud: {
    position: 'absolute',
    width: 200,
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6a5acd',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});