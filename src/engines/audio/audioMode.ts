import { setAudioModeAsync } from 'expo-audio';

let configured = false;

/**
 * Call once at startup. Game sound effects should play with the ringer switch on
 * silent (iOS) and mix with the user's music instead of pausing it.
 */
export function configureAudio() {
  if (configured) return;
  configured = true;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(
    (err) => __DEV__ && console.warn('[audio] mode', err)
  );
}
