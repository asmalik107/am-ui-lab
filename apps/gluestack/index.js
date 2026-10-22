// Custom entry so src/tv-config runs before expo-router evaluates any route
// (and therefore any gluestack component). Otherwise identical to "expo-router/entry".
import './src/tv-config';
import 'expo-router/entry';
