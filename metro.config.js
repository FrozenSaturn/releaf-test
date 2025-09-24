const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for better compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-web': 'react-native-web/dist/exports',
};

// Handle react-native-web exports
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
