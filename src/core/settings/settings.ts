import { isLanguage, type LanguageChoice } from '@/core/i18n/languages';

export type ThemeChoice = 'system' | 'light' | 'dark';

export type Settings = {
  language: LanguageChoice;
  theme: ThemeChoice;
  sound: boolean;
  vibration: boolean;
  /** Master volume, 0..1. */
  volume: number;
};

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  language: 'system',
  theme: 'system',
  sound: true,
  vibration: true,
  volume: 0.8,
});

const THEMES: readonly ThemeChoice[] = ['system', 'light', 'dark'];

const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
const unit = (v: unknown, d: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d;

/**
 * Rebuilds a Settings object from whatever storage returned. Storage is untrusted —
 * an older app version, a corrupt write or a hand-edited value must degrade to the
 * default for that one field, never crash or poison the rest. Unknown keys are dropped.
 *
 * When you add a setting: add it to the type, DEFAULT_SETTINGS and here.
 */
export function mergeSettings(stored: unknown): Settings {
  const s = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    language: s.language === 'system' || isLanguage(s.language) ? (s.language as LanguageChoice) : d.language,
    theme: THEMES.includes(s.theme as ThemeChoice) ? (s.theme as ThemeChoice) : d.theme,
    sound: bool(s.sound, d.sound),
    vibration: bool(s.vibration, d.vibration),
    volume: unit(s.volume, d.volume),
  };
}
