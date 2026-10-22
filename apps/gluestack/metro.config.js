// Lets Metro load the repo-level shared/ folder (tokens, copy, fixtures), then
// hands the config to Uniwind (gluestack-ui v5's Expo-only Tailwind v4 engine).
// The gluestack CLI overwrote this file and dropped watchFolders; merged back by hand.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
  // light and dark are built in; the CLI wrote extraThemes: ['dark'], which is redundant.
  extraThemes: ['brand'],
});
