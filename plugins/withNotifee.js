const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withNotifee(config) {
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    // Add notifee Maven repo to allprojects repositories
    if (!contents.includes('notifee')) {
      contents = contents.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        `allprojects {
    repositories {
        maven { url "\$rootDir/../node_modules/@notifee/react-native/android/libs" }`
      );
    }
    config.modResults.contents = contents;
    return config;
  });

  return config;
};
