// Lets Metro load the repo-level shared/ folder (tokens, copy, fixtures),
// then wraps everything in Uniwind. Uniwind's docs require withUniwindConfig
// to be the outermost wrapper: https://docs.uniwind.dev/quickstart
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
  // Third theme from shared/tokens. https://docs.uniwind.dev/theming/custom-themes
  extraThemes: ['brand'],
});
