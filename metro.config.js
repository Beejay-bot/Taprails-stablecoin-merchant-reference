const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/**
 * TapRails Merchant Reference Metro Config
 * Supports both sibling SDK development and installed npm package.
 */
const defaultConfig = getDefaultConfig(__dirname);

const localSdkPath = path.resolve(__dirname, '../TapRail-React-Native-SDK');
const hasLocalSdk = fs.existsSync(localSdkPath);

const watchFolders = [];
const blockList = [];

if (hasLocalSdk) {
  const localSdkSrcPath = path.resolve(localSdkPath, 'src');
  watchFolders.push(localSdkSrcPath);
  const escapedSdkPath = localSdkPath.replace(/\\/g, '[/\\\\]');
  blockList.push(
    new RegExp(`${escapedSdkPath}[/\\\\](node_modules|android|ios|lib|\\.git)[/\\\\].*`)
  );
}

const config = {
  watchFolders,
  resolver: {
    blockList,
    unstable_conditionNames: ['browser', 'require', 'react-native'],
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => path.resolve(__dirname, 'node_modules', name),
      }
    ),
    resolveRequest: (context, moduleName, platform) => {
      if (hasLocalSdk && moduleName === '@taprails/tap-to-pay') {
        return {
          filePath: path.resolve(localSdkPath, 'src/index.ts'),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = {
  ...defaultConfig,
  ...config,
  resolver: {
    ...defaultConfig.resolver,
    ...config.resolver,
  },
};
