// Lets Metro load the repo-level shared/ folder (tokens, copy, fixtures),
// then wraps the config with NativeWind v5 (react-native-css underneath).
// https://www.nativewind.dev/v5/api/with-nativewind
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../../shared')];

// Every colour token changes at runtime (theme switch through
// VariableContextProvider), so none may be inlined by the compiler.
// https://www.nativewind.dev/v5/guides/themes
const colorTokens = [
  'background', 'surface', 'surface-raised', 'text', 'text-muted', 'border',
  'primary', 'on-primary', 'danger', 'on-danger', 'success', 'focus', 'scrim',
];

module.exports = withNativewind(config, {
  inlineVariables: { exclude: colorTokens.map((t) => `--color-${t}`) },
});
