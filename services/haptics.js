import * as Haptics from 'expo-haptics';

export const triggerHaptic = async (type = 'medium', isSoundMuted = false) => {
  if (isSoundMuted) return;

  try {
    if (!Haptics) {
      console.warn('Haptics not available');
      return;
    }

    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    console.warn('Haptic feedback error:', error);
  }
};
