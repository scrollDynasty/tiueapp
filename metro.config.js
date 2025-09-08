const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Включаем экспериментальную функцию require.context
config.transformer.unstable_allowRequireContext = true;

// Добавляем поддержку Flipper
config.resolver.alias = {
  'react-native-flipper': 'react-native-flipper',
};

// Настройка для Flipper
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;