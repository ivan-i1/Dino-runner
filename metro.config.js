// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-game-engine depends on rxjs@6 / tslib@1. With package-exports resolution
// (on by default since SDK 53) Metro serves rxjs's ESM build, whose `tslib.default` is
// undefined, and the web build renders blank. Disable exports for just those two
// packages instead of globally — Phaser and others need exports to resolve correctly.
const LEGACY_PACKAGES = /^(rxjs|tslib)(\/|$)/;
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const ctx = LEGACY_PACKAGES.test(moduleName) ? { ...context, unstable_enablePackageExports: false } : context;
  return upstream ? upstream(ctx, moduleName, platform) : ctx.resolveRequest(ctx, moduleName, platform);
};

module.exports = config;
