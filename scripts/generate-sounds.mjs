#!/usr/bin/env node
// Synthesises the built-in sound effects into assets/sounds/*.wav. Zero dependencies and
// deterministic (seeded RNG), so a re-run produces identical files and no git diff.
// Replace with your own samples whenever you like — keep the file names or update
// src/engines/audio/sounds.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 44100;
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets/sounds');
mkdirSync(dir, { recursive: true });

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

/** A pitched "bonk": falling sine plus a short noise transient, exponential decay. */
function bounce(freq, seed, ms = 160) {
  const rng = mulberry32(seed);
  const n = Math.round((RATE * ms) / 1000);
  const out = new Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = freq * (1 + 0.6 * Math.exp(-t * 40));
    phase += (2 * Math.PI * f) / RATE;
    const env = Math.exp(-t * 28);
    const click = (rng() * 2 - 1) * Math.exp(-t * 400) * 0.35;
    out[i] = (Math.sin(phase) * 0.7 + click) * env;
  }
  return out;
}

/** A short UI tick. */
function tap(freq, ms = 45) {
  const n = Math.round((RATE * ms) / 1000);
  return Array.from({ length: n }, (_, i) => {
    const t = i / RATE;
    return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 90) * 0.5;
  });
}

const files = {
  'bounce-1.wav': bounce(220, 1),
  'bounce-2.wav': bounce(262, 2),
  'bounce-3.wav': bounce(196, 3),
  'tap-1.wav': tap(1320),
  'tap-2.wav': tap(1480),
};
for (const [name, samples] of Object.entries(files)) writeFileSync(join(dir, name), wav(samples));
console.log(`Wrote ${Object.keys(files).length} sounds to assets/sounds/`);
