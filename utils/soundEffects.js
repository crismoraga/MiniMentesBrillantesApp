import { Audio } from 'expo-av';

let backgroundMusic = null;

export const initAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return true;
  } catch (error) {
    console.warn('Error initializing audio:', error);
    return false;
  }
};

export const startBackgroundMusic = async (isMuted = false) => {
  try {
    await cleanup(); // Ensure previous audio is cleaned up
    await initAudio();

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/background.mp3'),
      { 
        isLooping: true,
        volume: 0.3,
        shouldPlay: !isMuted 
      }
    );

    backgroundMusic = sound; // Assign the sound object
    await backgroundMusic.playAsync(); // Start playing immediately if not muted
  } catch (error) {
    console.warn('Error starting background music:', error);
    backgroundMusic = null; // Reset on error
  }
};

export const toggleBackgroundMusic = async (isMuted) => {
  try {
    if (!backgroundMusic) {
      await startBackgroundMusic(isMuted); // Start music if not already playing
      return;
    }

    if (isMuted) {
      await backgroundMusic.pauseAsync(); // Pause if muted
    } else {
      await backgroundMusic.playAsync(); // Play if unmuted
    }
  } catch (error) {
    console.warn('Error toggling background music:', error);
  }
};

export const cleanup = async () => {
  try {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync().catch(() => {});
      await backgroundMusic.unloadAsync().catch(() => {});
      backgroundMusic = null; // Reset after cleanup
    }
  } catch (error) {
    console.warn('Error cleaning up audio:', error);
  }
};

export const playSound = async (type, isMuted = false) => {
  if (isMuted) return;

  try {
    const soundFiles = {
      correct: require('../assets/correct.mp3'),
      wrong: require('../assets/incorrect.mp3'),
      complete: require('../assets/complete.mp3'),
    };

    const { sound } = await Audio.Sound.createAsync(soundFiles[type], {
      shouldPlay: true,
      volume: 1.0
    });

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync(); // Clean up after playback finishes
      }
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};