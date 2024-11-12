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
      background: '#87CEEB',    // cielo
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

  const colorThemes = {
    default: {
      primary: '#FF6F61',
      secondary: '#6B5B95',
      background: '#FEEAE6',
      text: '#333333',
    },
    ocean: {
      primary: '#03A9F4',
      secondary: '#01579B',
      background: '#E1F5FE',
      text: '#212121',
    },
    forest: {
      primary: '#8BC34A',
      secondary: '#33691E',
      background: '#DCEDC8',
      text: '#212121',
    },
  };

  const [selectedTheme, setSelectedTheme] = useState('default');

  const loadAudio = async () => {
    try {
      if (backgroundMusic) {
        await backgroundMusic.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/background.mp3'),
        {
          isLooping: true,
          volume: 0.5,
          shouldPlay: !isMusicMuted,
        }
      );

      await sound.playAsync();
      setBackgroundMusic(sound);
    } catch (error) {
      console.warn('Error loading audio:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadSettings();
      if (!isMusicMuted) {
        await loadAudio();
      }
    };

    initializeApp();

    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
    };
  }, []);

  const handleMusicToggle = async () => {
    try {
      const newMutedState = !isMusicMuted;
      setIsMusicMuted(newMutedState);

      if (newMutedState) {
        if (backgroundMusic) {
          await backgroundMusic.stopAsync();
          await backgroundMusic.unloadAsync();
          setBackgroundMusic(null);
        }
      } else {
        await loadAudio();
      }

      await saveSettings({
        musicMuted: newMutedState,
        soundMuted: isSoundMuted,
        colorBlindMode: isColorBlindMode,
        theme: selectedTheme
      });
    } catch (error) {
      console.warn('Error toggling music:', error);
    }
  };

  const handleSoundToggle = async () => {
    setIsSoundMuted(!isSoundMuted);
    await saveSettings({ musicMuted: isMusicMuted, soundMuted: !isSoundMuted, colorBlindMode: isColorBlindMode });
  };

  const handleColorBlindToggle = async () => {
    setIsColorBlindMode(!isColorBlindMode);
    await saveSettings({ musicMuted: isMusicMuted, soundMuted: isSoundMuted, colorBlindMode: !isColorBlindMode });
  };

  const getColor = (type) => {
    const scheme = isColorBlindMode ? colorSchemes.colorBlind : colorSchemes.normal;
    return scheme[type] || scheme.primary;
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const { musicMuted, soundMuted, colorBlindMode, theme } = JSON.parse(settings);
        setIsMusicMuted(musicMuted);
        setIsSoundMuted(soundMuted);
        setIsColorBlindMode(colorBlindMode);
        if (theme) setSelectedTheme(theme);
      }
      loadAudio();
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
    handleSoundToggle,
    handleColorBlindToggle,
    selectedTheme,
    setSelectedTheme: async (themeName) => {
      setSelectedTheme(themeName);
      await saveSettings({
        // ...otros settings...
        theme: themeName,
      });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);
