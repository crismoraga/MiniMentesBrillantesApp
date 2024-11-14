import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { startBackgroundMusic, toggleBackgroundMusic, cleanup } from '../utils/soundEffects';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  const colorSchemes = {
    normal: {
      primary: '#FF5733',
      secondary: '#33FF57',
      accent: '#FF33A1',
      highlight: '#FFD700',
      background: '#87CEEB',
      text: '#4A4A4A',
      button: '#6a5acd',
    },
    colorBlind: {
      primary: '#0077BB',
      secondary: '#FFDD00',
      accent: '#EE7733',
      highlight: '#FFFFFF',
      background: '#F5F5F5',
      text: '#000000',
      button: '#000000',
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

  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        if (mounted) {
          await loadSettings();
          // Pequeño delay para asegurar que todo está listo
          await new Promise(resolve => setTimeout(resolve, 100));
          await startBackgroundMusic(isMusicMuted);
        }
      } catch (error) {
        console.warn('Error in initializeApp:', error);
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      cleanup().catch(() => {});
    };
  }, []);

  const handleMusicToggle = async () => {
    try {
      const newMutedState = !isMusicMuted;
      setIsMusicMuted(newMutedState);
      await toggleBackgroundMusic(newMutedState);
      await saveSettings({
        musicMuted: newMutedState,
        soundMuted: isSoundMuted,
        colorBlindMode: isColorBlindMode,
        theme: selectedTheme,
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
        musicMuted: isMusicMuted,
        soundMuted: isSoundMuted,
        colorBlindMode: isColorBlindMode,
        theme: themeName,
      });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);