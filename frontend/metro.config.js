const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force zustand to use CommonJS version on web to avoid import.meta issues
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.startsWith('zustand')) {
    // Map zustand ESM imports to CommonJS
    const zustandPath = path.dirname(require.resolve('zustand/package.json'));

    if (moduleName === 'zustand') {
      return {
        filePath: path.join(zustandPath, 'index.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'zustand/middleware') {
      return {
        filePath: path.join(zustandPath, 'middleware.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'zustand/shallow') {
      return {
        filePath: path.join(zustandPath, 'shallow.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'zustand/vanilla') {
      return {
        filePath: path.join(zustandPath, 'vanilla.js'),
        type: 'sourceFile',
      };
    }
  }

  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
