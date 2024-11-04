import { Audio } from 'expo-av';

let sound = null;
let backgroundMusicSound = null;

export const initAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
  } catch (error) {
    console.warn('Error initializing audio:', error);
  }
};

export const startBackgroundMusic = async (isMuted = false) => {
  try {
    if (backgroundMusicSound) {
      await backgroundMusicSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/background.mp3'),
      {
        isLooping: true,
        shouldPlay: !isMuted,
        volume: 0.5,
      },
      null,
      true
    );

    backgroundMusicSound = sound;
    if (!isMuted) {
      await sound.playAsync();
    }
  } catch (error) {
    console.warn('Error starting background music:', error);
  }
};

export const toggleBackgroundMusic = async (isMuted) => {
  try {
    if (!backgroundMusicSound) return;
    
    if (isMuted) {
      await backgroundMusicSound.pauseAsync();
    } else {
      await backgroundMusicSound.playAsync();
    }
  } catch (error) {
    console.warn('Error toggling background music:', error);
  }
};

export const playSound = async (type, isMuted = false) => {
  if (isMuted) return;

  try {
    if (sound) {
      await sound.unloadAsync();
    }

    const soundFiles = {
      correct: require('../assets/correct.mp3'),
      wrong: require('../assets/incorrect.mp3'),
      complete: require('../assets/complete.mp3'),
    };

    const { sound: newSound } = await Audio.Sound.createAsync(soundFiles[type], {
      shouldPlay: true,
      volume: 1.0
    });

    sound = newSound;

    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
        sound = null;
      }
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};

export const cleanup = async () => {
  try {
    if (sound) {
      await sound.unloadAsync();
    }
    if (backgroundMusicSound) {
      await backgroundMusicSound.unloadAsync();
    }
  } catch (error) {
    console.warn('Error cleaning up audio:', error);
  }
};
