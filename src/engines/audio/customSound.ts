import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { storageKey } from '@/core/storage/keys';

export type CustomSound = { uri: string; name: string };

/**
 * Lets the user pick an audio file and keeps it across launches. The picked file is
 * copied into the app's document directory under a fixed name, because picker URIs are
 * temporary. On web, files cannot be persisted, so the choice lasts for the session.
 */
export async function pickCustomSound(slot: string): Promise<CustomSound | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (Platform.OS === 'web') return { uri: asset.uri, name: asset.name };

  const dot = asset.name.lastIndexOf('.');
  const dest = new File(Paths.document, `custom-${slot}${dot >= 0 ? asset.name.slice(dot) : '.mp3'}`);
  if (dest.exists) dest.delete();
  new File(asset.uri).copy(dest);
  const sound = { uri: dest.uri, name: asset.name };
  await AsyncStorage.setItem(storageKey(`sound:${slot}`), JSON.stringify(sound));
  return sound;
}

/** The saved sound for `slot`, or null. Purges the key if the file has disappeared. */
export async function loadCustomSound(slot: string): Promise<CustomSound | null> {
  if (Platform.OS === 'web') return null;
  const key = storageKey(`sound:${slot}`);
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as CustomSound;
    if (typeof saved?.uri === 'string' && new File(saved.uri).exists) return saved;
  } catch {
    // corrupt entry — fall through and purge it
  }
  await AsyncStorage.removeItem(key);
  return null;
}

export async function clearCustomSound(slot: string) {
  const key = storageKey(`sound:${slot}`);
  if (Platform.OS !== 'web') {
    try {
      const raw = await AsyncStorage.getItem(key);
      const saved = raw ? (JSON.parse(raw) as CustomSound) : null;
      if (saved?.uri) {
        const f = new File(saved.uri);
        if (f.exists) f.delete();
      }
    } catch {}
  }
  await AsyncStorage.removeItem(key);
}
