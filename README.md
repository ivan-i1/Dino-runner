# Dino-runner

An endless-runner game in the spirit of the Chrome offline dinosaur game, with three playable dinosaurs. The design is being worked out in the `ADV-REV-Dino-runner-V*.md` dumps. The project was bootstrapped from [Base App](https://github.com/ivan-i1/BaseApp) at `81ddd19`: one Expo project that runs on **Android, iOS and web**, with these modules already built, tested and wired together:

| Module | Where | Extracted from |
|---|---|---|
| Navigation (Expo Router: Home, Settings, About, demos) | `src/app/` | Tessera |
| Translations: en, es, fr, it, de, pt, with device detection, a persisted picker, plurals and typed keys | `src/core/i18n/` | Bingepick, proyecto-comun, toastmasters plan |
| Persisted settings (language, theme, sound, volume, vibration), validated on load | `src/core/settings/` | Pinbolita |
| Light and dark theme tokens | `src/core/theme/` | Tessera |
| Menu manager (pause, options, nested menus, Android back) | `src/menu/` | Bounce Fidget and Pinbolita control bar |
| Game loop engine (react-native-game-engine plus refresh-rate-independent `frameScale`) | `src/engines/game-loop/` | Bounce Fidget, Pinbolita |
| Phaser engine (runs natively in the page on web, in an offline WebView on Android and iOS) | `src/engines/phaser/` | swap (Phaser port), Dino-runner plan |
| Audio engine (overlapping-voice sound banks, custom user sounds, generated SFX) | `src/engines/audio/` | Bounce Fidget, Pinbolita |
| Haptics, gated by the Vibration setting | `src/engines/haptics/` | Bounce Fidget, Pinbolita |
| Tilt and shake sensors with calibration | `src/engines/sensors/` | Bounce Fidget, laberinto plan |
| API and LLM client (env base URL, retries, 429, streaming, provider interface) | `src/engines/api/` | Tessera, Bingepick |
| Icon, splash and favicon pipeline from a single image | `scripts/generate-icons.mjs` | store-listing workflow |
| Android release signing that keeps secrets out of git | `plugins/withReleaseSigning.js` | Bounce Fidget, Pinbolita |
| Rename to a new app identity in one command | `scripts/rename-app.js` | — |

Each engine is self-contained. To drop one, delete its folder and its demo screen.

## Quick start

```bash
npm install                # also builds the Phaser WebView page (postinstall)
npm run web                # browser: http://localhost:8081
npm run android            # builds and installs a debug app on an emulator or device
npm run ios                # builds and installs on the iOS Simulator (needs Xcode)
```

`npm run android` and `npm run ios` produce **development builds**, not Expo Go builds. Some modules, such as the WebView and audio, need native code that Expo Go doesn't bundle. After the first build, `npm start` is enough to reload JS changes.

You need Node 20 or newer. Android needs JDK 17 and the Android SDK (`ANDROID_HOME`). iOS needs Xcode and CocoaPods. `npm run icons` needs ImageMagick 7.

## Starting a new app from this

```bash
cp -R BaseApp MyApp && cd MyApp && rm -rf .git node_modules android ios && git init
npm install
npm run rename -- "My App"              # name, slug, scheme, package id, bundle id, version reset
# replace assets/source/icon.png (and optionally foreground.png), then:
npm run icons
npm run prebuild
```

Then delete the engines and demos you don't need.

## Images and icons

- Put the master artwork in `assets/source/icon.png`. It should be square, at least 1024 px, and full bleed.
- Optionally add `assets/source/foreground.png`: the glyph on a transparent background, used for Android adaptive icons and the splash screen.
- Run `npm run icons` to write everything that `app.json` references:
  - iOS and Android icon
  - adaptive foreground, background and monochrome layers
  - splash
  - favicon
  - the 512 px Play listing icon in `assets/store/`
- Background colours are read from `app.json`.
- Icons are baked into the native projects at prebuild, so run `npm run prebuild` afterwards.
- Images used inside the app go in `assets/images/`. Load them with `require('@assets/images/x.png')` through `expo-image`, as the Home screen does.

## Bundling and releases

| Command | Output |
|---|---|
| `npm run export:web` | Static web build in `dist/` (single-page app; host on any static host) |
| `npm run export:native` | Android and iOS JS bundles in `dist-native/` (smoke check that the bundles build) |
| `npm run bundle` | Signed Android App Bundle (`android/app/build/outputs/bundle/release/app-release.aab`) |
| `npm run apk:release` | Signed release APK |
| `npx eas-cli build` | Cloud builds for either store, if you prefer EAS |

### Release signing (Android)

1. Copy `credentials.example/` to `credentials/`. The `credentials/` folder is gitignored.
2. Generate a **new** upload keystore for each app. The command is in `credentials.example/keystore.properties`.
3. Fill in the passwords.
4. Back the keystore and its passwords up somewhere off this machine.

Without `credentials/`, release builds fall back to the debug key and print a warning. Play rejects debug-signed bundles.

`/android` and `/ios` are generated by `expo prebuild`, which also applies the config plugins, and they are gitignored. Configure native behaviour in `app.json` or a plugin, never by editing the generated folders.

## Debugging

- In the running app, press `j` in the Metro terminal to open the JS debugger (React Native DevTools). Shake the device or press `m` for the dev menu.
- The Phaser WebView reports page errors to the Metro log as `[phaser]` warnings. On Android, inspect the WebView at `chrome://inspect`. On iOS, use Safari → Develop → Simulator.
- Run `npm run doctor` to check dependency versions against the SDK.

## Quality gates

```bash
npm run check    # typecheck + jest + lint
```

- The unit tests cover the pure logic:
  - frame scaling
  - ball physics
  - variant picking
  - settings validation
  - language resolution
  - **locale key parity across all six languages**
  - menu stack
  - retry policy
  - tilt maths
  - identity derivation
- Anything that needs a device can only be verified on a device: sensors, audio, haptics, rendering, game feel.

## Configuration

| What | Where |
|---|---|
| Backend URL | `EXPO_PUBLIC_API_URL` in `.env.local` (see `.env.example`). It is public: it ships inside the bundle |
| Default settings / new settings | `src/core/settings/settings.ts` (type, defaults, `mergeSettings`) |
| Strings | `src/core/i18n/locales/*.json`. English is the reference; a test fails if any language is missing a key |
| Add a language | Add it to `SUPPORTED_LANGUAGES`, `LANGUAGE_NAMES`, `resources.ts`, a JSON file, and its plural locale-data import in `polyfills.ts` |
| Colours | `src/core/theme/tokens.ts` |
| Blocked Android permissions | `app.json` → `android.blockedPermissions` |
