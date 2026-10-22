// Unistyles Babel plugin: rewrites react-native imports under src/ to
// Unistyles factories and detects style dependencies.
// https://www.unistyl.es/v3/start/getting-started
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
  };
};
