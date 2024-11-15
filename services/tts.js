
import * as Speech from 'expo-speech';

export const speak = async (text, options = {}) => {
  try {
    const defaultOptions = {
      language: 'es-ES',
      pitch: 1.0,
      rate: 0.9,
      ...options
    };
    
    await Speech.speak(text, defaultOptions);
  } catch (error) {
    console.error('Error en TTS:', error);
  }
};

export const stopSpeak = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error al detener TTS:', error);
  }
};