// Entry point of the self-contained page the native WebView loads. Bundled together
// with Phaser by scripts/build-phaser-html.mjs. Not imported by the app itself.
import type { GameEvent, HostCommand } from './bridge';
import { startGame } from './game';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (data: string) => void };
    __hostCommand?: (c: HostCommand) => void;
  }
}

const emit = (e: GameEvent) => window.ReactNativeWebView?.postMessage(JSON.stringify(e));
window.addEventListener('error', (e) => emit({ type: 'log', message: String(e.message) }));
const params = new URLSearchParams(location.hash.slice(1));
const handle = startGame(document.getElementById('game')!, emit, params.get('bg') ?? '#0F1016');
window.__hostCommand = (c) => handle.command(c);
