module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Worklets plugin has to be listed last
      'react-native-worklets/plugin',
    ],
  };
};
