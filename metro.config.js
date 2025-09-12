const { getDefaultConfig } = require('expo/metro-config');

// Получаем дефолтную конфигурацию Expo
const config = getDefaultConfig(__dirname);

// Включаем экспериментальную функцию require.context
config.transformer.unstable_allowRequireContext = true;

module.exports = config;