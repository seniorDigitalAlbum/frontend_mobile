const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// GitHub Pages를 위한 baseUrl 설정
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  ...config.resolver.alias,
};

// Web 빌드를 위한 publicPath 설정
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.publicPath = '/frontend_mobile/';
}

// Jest worker 에러 해결을 위한 설정
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
