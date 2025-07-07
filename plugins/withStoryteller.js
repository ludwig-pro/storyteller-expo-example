const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

function withStorytellerAndroid(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // Modify the root build.gradle
      const buildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        'build.gradle'
      );
      
      let buildGradleContents = readFileSync(buildGradlePath, 'utf8');
      
      // Check if the repository is already added
      if (!buildGradleContents.includes('storyteller.mycloudrepo.io')) {
        // Find the allprojects block and add the repository
        buildGradleContents = buildGradleContents.replace(
          /allprojects\s*{[\s\S]*?repositories\s*{([\s\S]*?)}/,
          (match, repositories) => {
            const storytellerRepo = `
        // Required for Storyteller SDK native dependencies
        maven { url 'https://storyteller.mycloudrepo.io/public/repositories/storyteller-sdk' }`;
            
            return match.replace(
              /repositories\s*{([\s\S]*?)}/,
              `repositories {${repositories}${storytellerRepo}
    }`
            );
          }
        );
      }
      
      // Add Compose Compiler plugin to buildscript
      if (!buildGradleContents.includes('org.jetbrains.kotlin.plugin.compose')) {
        buildGradleContents = buildGradleContents.replace(
          /(buildscript\s*{[\s\S]*?dependencies\s*{[\s\S]*?)(})/,
          (match, deps, closing) => {
            return `${deps}        classpath("org.jetbrains.kotlin:compose-compiler-gradle-plugin:2.0.0")
${closing}`;
          }
        );
      }
      
      writeFileSync(buildGradlePath, buildGradleContents);
      
      // Modify the app/build.gradle
      const appBuildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'build.gradle'
      );
      
      let appBuildGradleContents = readFileSync(appBuildGradlePath, 'utf8');
      
      // Add the compose compiler plugin
      if (!appBuildGradleContents.includes('org.jetbrains.kotlin.plugin.compose')) {
        appBuildGradleContents = appBuildGradleContents.replace(
          /apply plugin: "com.android.application"/,
          `apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.plugin.compose"`
        );
      }
      
      // Add buildFeatures for Compose
      if (!appBuildGradleContents.includes('buildFeatures')) {
        appBuildGradleContents = appBuildGradleContents.replace(
          /(android\s*{)/,
          `$1
    buildFeatures {
        compose true
    }`
        );
      }
      
      // Add Compose dependencies
      if (!appBuildGradleContents.includes('androidx.compose:compose-bom')) {
        appBuildGradleContents = appBuildGradleContents.replace(
          /(dependencies\s*{)/,
          `$1
    // Compose BOM
    implementation platform('androidx.compose:compose-bom:2024.12.01')
    implementation 'androidx.compose.runtime:runtime'
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.foundation:foundation'
    implementation 'androidx.compose.material:material'
    implementation 'androidx.activity:activity-compose:1.9.3'`
        );
      }
      
      writeFileSync(appBuildGradlePath, appBuildGradleContents);
      
      return config;
    },
  ]);
}

function withStorytelleriOS(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      
      let podfileContents = readFileSync(podfilePath, 'utf8');
      
      // Check if sources are already added
      if (!podfileContents.includes('getstoryteller/storyteller-sdk-ios-podspec')) {
        // Add sources at the beginning of the file
        const sources = `source 'https://cdn.cocoapods.org/'
source 'https://github.com/getstoryteller/storyteller-sdk-ios-podspec.git'

`;
        
        // Check if there are already source declarations
        if (podfileContents.startsWith('source')) {
          // Replace existing sources
          podfileContents = podfileContents.replace(
            /^(source.*\n)+/,
            sources
          );
        } else {
          // Add sources at the beginning
          podfileContents = sources + podfileContents;
        }
        
        writeFileSync(podfilePath, podfileContents);
      }
      
      return config;
    },
  ]);
}

module.exports = function withStoryteller(config) {
  return withPlugins(config, [
    withStorytellerAndroid,
    withStorytelleriOS,
  ]);
};