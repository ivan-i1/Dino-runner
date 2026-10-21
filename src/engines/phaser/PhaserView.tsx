import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { GameEvent, HostCommand } from './bridge';
import html from './generated/phaserHtml';

export type PhaserViewHandle = { send: (c: HostCommand) => void };
export type PhaserViewProps = { onEvent?: (e: GameEvent) => void; background?: string };

/**
 * Native host: Phaser needs a DOM and a canvas, which React Native does not have, so
 * the game runs in a WebView loading a self-contained page (Phaser + your scenes,
 * inlined by `npm run phaser:build`, which also runs on postinstall). Works offline.
 * The web build uses PhaserView.web.tsx instead and runs Phaser directly.
 */
export const PhaserView = forwardRef<PhaserViewHandle, PhaserViewProps>(function PhaserView(
  { onEvent, background = '#0F1016' },
  ref
) {
  const web = useRef<WebView>(null);
  useImperativeHandle(
    ref,
    () => ({
      send: (c: HostCommand) => web.current?.injectJavaScript(`window.__hostCommand && window.__hostCommand(${JSON.stringify(c)}); true;`),
    }),
    []
  );
  return (
    <WebView
      ref={web}
      style={[styles.fill, { backgroundColor: background }]}
      originWhitelist={['*']}
      // The hash passes boot parameters without string-templating them into the HTML.
      source={{ html, baseUrl: `https://phaser.local/#bg=${encodeURIComponent(background)}` }}
      onMessage={(e) => {
        try {
          const event = JSON.parse(e.nativeEvent.data) as GameEvent;
          if (__DEV__ && event.type === 'log') console.warn('[phaser]', event.message);
          onEvent?.(event);
        } catch {}
      }}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      javaScriptEnabled
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
    />
  );
});

const styles = StyleSheet.create({ fill: { flex: 1 } });
