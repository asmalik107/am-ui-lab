// Written by `gluestack-ui init --uniwind`. The CLI also added
// 'react-native-worklets/plugin', but babel-preset-expo (SDK 57) already adds it
// automatically when react-native-worklets is installed, so it was removed to
// avoid running the worklets transform twice.
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
