# CLAUDE.md

Read `AGENTS.md` (Expo's general rules) and `README.md` (what each module is) first.

## Commands

```bash
npm run web | android | ios    # android/ios are dev builds (expo run:*), not Expo Go
npm run check                  # tsc --noEmit + jest + expo lint — the automated gates
npm run export:web             # web bundle smoke check
npm run export:native          # android + ios JS bundle smoke check
npm run phaser:build           # REQUIRED after editing anything in src/engines/phaser/
npx jest -t "mergeSettings"    # single test by name
```

The gates only reach pure logic. Sensors, audio, haptics, rendering and the WebView must be verified on a device or simulator. Say what you actually ran.

## Architecture rules that are easy to break

- **Settings live in one zustand store** (`src/core/settings/store.ts`), persisted with validation through `mergeSettings`.
  - React reads it with `useSettings(selector)`. Frame loops and sensor callbacks read `useSettings.getState()`.
  - Do not mirror settings into module variables.
  - Adding a setting means editing the type, `DEFAULT_SETTINGS` and `mergeSettings` together.
- **Every frame-loop force is scaled by `dtf`** (`frameScale`). The loop runs at the display rate, so unscaled code runs twice as fast on 120 Hz phones.
- **RNGE reads `entities` once at mount.** Keep the object stable (a `useRef`) and mutate it from systems.
- **Entity renderers must start with `'use no memo'`.** The React Compiler is on (`app.json` → `experiments.reactCompiler`). It memoises components on the assumption that props are immutable, but RNGE re-renders entities by mutating them in place. Without the directive the entity freezes on its first frame. This was seen on Android and web: 2 renders instead of thousands.
- **Pure logic goes in import-free modules** (`bounce.ts`, `pickVariant.ts`, `tilt.ts`, `retry.ts`, `menuModel.ts`, `settings.ts`, `languages.ts`) with tests in `__tests__/`.
- **Phaser** code under `src/engines/phaser/` must import only `phaser` and relative files. It is bundled by esbuild into the native WebView page (`generated/phaserHtml.ts`, gitignored, rebuilt on postinstall). On web, `PhaserView.web.tsx` dynamic-imports `game.ts`. Host and game talk only through the types in `bridge.ts`.
- **Metro** disables package exports only for `rxjs`/`tslib`, because react-native-game-engine needs that for web. Do not disable it globally: Phaser resolves through exports.
- **Streaming must use `fetch` from `expo/fetch`.** RN's global fetch has no `Response.body` on native.
- **expo-audio:** use `player.setPlaybackRate()`. Assigning `playbackRate` throws at runtime even though it typechecks.
- **Strings:** every user-visible string goes through `t()`, with keys in all six locale files. `__tests__/locales.test.ts` enforces parity. Plurals need `_one` and `_other`; es, fr, it and pt also take `_many`.
- **Native folders are generated.** Never edit `/android` or `/ios`; change `app.json` or a plugin and run `npm run prebuild`.
- **Never commit** `credentials/`, keystores or `.env.local`. The repo is public.
