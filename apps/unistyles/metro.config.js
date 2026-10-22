// Lets Metro load the repo-level shared/ folder (tokens, copy, fixtures).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];
module.exports = config;
