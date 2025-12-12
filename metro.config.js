const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.unstable_allowRequireContext = true;

module.exports = config;
