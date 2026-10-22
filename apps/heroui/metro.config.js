// Lets Metro load the repo-level shared/ folder (tokens, copy, fixtures),
// then wraps the config with Uniwind (must be the outermost wrapper).
// https://docs.uniwind.dev/quickstart
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
  extraThemes: ['brand'],
});
