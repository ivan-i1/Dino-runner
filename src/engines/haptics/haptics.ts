import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { getSettings } from '@/core/settings/store';

// Every haptic goes through here so the Vibration setting is honoured everywhere and
// a missing actuator (web, emulators, some tablets) never throws into a frame loop.
const enabled = () => Platform.OS !== 'web' && getSettings().vibration;
const fire = (p: Promise<void>) => p.catch((err) => __DEV__ && console.warn('[haptics]', err));

export const haptics = {
  /** Light tick for UI presses. */
  tap: () => enabled() && fire(Haptics.selectionAsync()),
  /** Collision feedback; pick strength from impact speed. */
  impact: (style: 'light' | 'medium' | 'heavy' = 'medium') =>
    enabled() &&
    fire(
      Haptics.impactAsync(
        style === 'light'
          ? Haptics.ImpactFeedbackStyle.Light
          : style === 'heavy'
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
      )
    ),
  success: () => enabled() && fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => enabled() && fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
