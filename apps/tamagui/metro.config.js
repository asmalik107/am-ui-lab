// Expo's Metro config, plus:
// - the repo-level shared/ folder (tokens, copy, fixtures)
// - Tamagui v3's Metro plugin (replaces the removed Babel plugin). It reads
//   tamagui.build.ts for its options. https://tamagui.dev/docs/guides/metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];
module.exports = withTamagui(config);
