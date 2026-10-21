import { DEFAULT_SETTINGS, mergeSettings } from '@/core/settings/settings';

describe('mergeSettings', () => {
  it('returns the defaults for anything that is not an object', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings('garbage')).toEqual(DEFAULT_SETTINGS);
  });
  it('keeps valid stored values', () => {
    expect(mergeSettings({ sound: false, volume: 0.3, language: 'es', theme: 'dark' })).toMatchObject({
      sound: false,
      volume: 0.3,
      language: 'es',
      theme: 'dark',
    });
  });
  it('rejects wrong types and unknown enum values instead of trusting storage', () => {
    const merged = mergeSettings({ sound: 'yes', language: 'xx', theme: 'neon', vibration: 1 });
    expect(merged.sound).toBe(DEFAULT_SETTINGS.sound);
    expect(merged.language).toBe(DEFAULT_SETTINGS.language);
    expect(merged.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(merged.vibration).toBe(DEFAULT_SETTINGS.vibration);
  });
  it('clamps numbers into range', () => {
    expect(mergeSettings({ volume: 7 }).volume).toBe(1);
    expect(mergeSettings({ volume: -1 }).volume).toBe(0);
    expect(mergeSettings({ volume: NaN }).volume).toBe(DEFAULT_SETTINGS.volume);
  });
  it('drops keys it does not know', () => {
    expect(mergeSettings({ hacked: true })).not.toHaveProperty('hacked');
  });
});
