const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to fix React Native Firebase build error with use_frameworks! :linkage => :static
 * Adds $RNFirebaseAsStaticFramework = true to Podfile
 */
function withFirebaseStaticFramework(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        // Check if already added
        if (!podfileContent.includes('$RNFirebaseAsStaticFramework')) {
          // Add after the require 'json' line
          const lines = podfileContent.split('\n');
          const newLines = [];

          for (const line of lines) {
            newLines.push(line);
            if (line.includes("require 'json'")) {
              newLines.push('');
              newLines.push('# CRITICAL: Tell React Native Firebase to build as static framework');
              newLines.push('# This is the official fix for use_frameworks! :linkage => :static compatibility');
              newLines.push('$RNFirebaseAsStaticFramework = true');
            }
          }

          podfileContent = newLines.join('\n');
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added $RNFirebaseAsStaticFramework = true to Podfile');
        }
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseStaticFramework;
