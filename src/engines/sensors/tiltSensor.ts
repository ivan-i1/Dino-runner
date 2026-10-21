import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { applyDeadzone, deviceToScreen, isShake, lowPass, type Vec } from './tilt';

/**
 * Live tilt, as module-level state so frame loops read it synchronously without a
 * re-render. `gravity` is the smoothed screen-space downhill vector in g (≈ sin of the
 * tilt angle), already calibrated and dead-zoned; `raw` is the last sample.
 */
export const tilt = {
  gravity: { x: 0, y: 0 } as Vec,
  raw: { x: 0, y: 0 } as Vec,
  shakes: 0,
  available: false,
};

const SMOOTHING = 0.35; // per-sample EMA weight for steering: responsive but not twitchy
const GRAVITY_LERP = 0.08; // slow estimate, used only to detect shakes
const SHAKE_THRESHOLD = 1.2; // g of residual
const SHAKE_COOLDOWN_MS = 250;

let offset: Vec = { x: 0, y: 0 };
let deadzone = 0.03;
let slow: Vec | null = null;
let lastShake = 0;
let subscribers = 0;
let subscription: { remove: () => void } | null = null;
const shakeListeners = new Set<() => void>();

function onSample(s: { x: number; y: number }) {
  const screen = deviceToScreen(s);
  tilt.raw = screen;
  slow = slow ? lowPass(slow, screen, GRAVITY_LERP) : screen;
  const now = Date.now();
  if (isShake(slow, screen, SHAKE_THRESHOLD) && now - lastShake > SHAKE_COOLDOWN_MS) {
    lastShake = now;
    tilt.shakes++;
    shakeListeners.forEach((l) => l());
  }
  const calibrated = { x: screen.x - offset.x, y: screen.y - offset.y };
  tilt.gravity = applyDeadzone(lowPass(tilt.gravity, calibrated, SMOOTHING), deadzone);
}

/** Reference-counted: the sensor runs only while at least one consumer is mounted. */
export async function startTilt(intervalMs = 16): Promise<boolean> {
  subscribers++;
  if (subscription) return tilt.available;
  // Web: expo-sensors needs a user-gesture permission prompt on iOS Safari and is
  // unreliable elsewhere, so the template treats tilt as unavailable on web.
  tilt.available = Platform.OS !== 'web' && (await Accelerometer.isAvailableAsync().catch(() => false));
  if (!tilt.available || subscribers === 0) return tilt.available;
  Accelerometer.setUpdateInterval(intervalMs);
  subscription = Accelerometer.addListener(onSample);
  return true;
}

export function stopTilt() {
  subscribers = Math.max(0, subscribers - 1);
  if (subscribers === 0 && subscription) {
    subscription.remove();
    subscription = null;
    tilt.gravity = { x: 0, y: 0 };
    slow = null;
  }
}

/** Treat the phone's current angle as level (players rarely hold a phone flat). */
export function calibrateTilt() {
  offset = { ...tilt.raw };
  tilt.gravity = { x: 0, y: 0 };
}

export function setTiltDeadzone(g: number) {
  deadzone = g;
}

export function onShake(listener: () => void) {
  shakeListeners.add(listener);
  return () => void shakeListeners.delete(listener);
}

/** Starts the sensor for the lifetime of the component; returns availability. */
export function useTiltSensor(): boolean | undefined {
  const [available, setAvailable] = useState<boolean>();
  useEffect(() => {
    let alive = true;
    startTilt().then((a) => alive && setAvailable(a));
    return () => {
      alive = false;
      stopTilt();
    };
  }, []);
  return available;
}
