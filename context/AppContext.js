import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);

  const colorSchemes = {
    normal: {
      primary: '#FF5733',        // Rojo
      secondary: '#33FF57',      // Verde
      accent: '#FF33A1',        // Rosa
      highlight: '#FFD700',     // Dorado
      background: '#FFF1E6',    // Crema
      text: '#4A4A4A',         // Gris oscuro
      button: '#6a5acd',       // Morado
    },
    colorBlind: {
      primary: '#0077BB',      // Azul (reemplaza rojo)
      secondary: '#FFDD00',    // Amarillo (reemplaza verde)
      accent: '#EE7733',       // Naranja (reemplaza rosa)
      highlight: '#FFFFFF',    // Blanco (reemplaza dorado)
      background: '#F5F5F5',   // Gris claro
      text: '#000000',         // Negro
      button: '#000000',       // Negro
    }
  };

  useEffect(() => {
    loadSettings();
    setupBackgroundMusic();
    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
    };
  }, []);

  const setupBackgroundMusic = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/background.mp3'),
        { 
          isLooping: true,
          shouldPlay: !isMusicMuted,
          volume: 0.5 
        }
      );
      setBackgroundMusic(sound);
    } catch (error) {
      console.warn('Error loading background music:', error);
    }
  };

  const handleMusicToggle = async () => {
    try {
      if (!backgroundMusic) return;
      
      if (isMusicMuted) {
        await backgroundMusic.playAsync();
      } else {
        await backgroundMusic.pauseAsync();
      }
      setIsMusicMuted(!isMusicMuted);
      await saveSettings({ musicMuted: !isMusicMuted, soundMuted: isSoundMuted, colorBlindMode: isColorBlindMode });
    } catch (error) {
      console.warn('Error toggling music:', error);
    }
  };

  const getColor = (type) => {
    const scheme = isColorBlindMode ? colorSchemes.colorBlind : colorSchemes.normal;
    return scheme[type] || colorSchemes.normal[type];
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const { musicMuted, soundMuted, colorBlindMode } = JSON.parse(settings);
        setIsMusicMuted(musicMuted);
        setIsSoundMuted(soundMuted);
        setIsColorBlindMode(colorBlindMode);
      }
    } catch (error) {
      console.warn('Error loading settings:', error);
    }
  };

  const saveSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving settings:', error);
    }
  };

  const value = {
    isMusicMuted,
    isSoundMuted,
    isColorBlindMode,
    getColor,
    handleMusicToggle,
    handleSoundToggle: async () => {
      setIsSoundMuted(!isSoundMuted);
      await saveSettings({ musicMuted: isMusicMuted, soundMuted: !isSoundMuted, colorBlindMode: isColorBlindMode });
    },
    handleColorBlindToggle: async () => {
      setIsColorBlindMode(!isColorBlindMode);
      await saveSettings({ musicMuted: isMusicMuted, soundMuted: isSoundMuted, colorBlindMode: !isColorBlindMode });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);
