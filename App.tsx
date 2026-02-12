/**
 * 피로도 앱 메인 파일
 */

import React from 'react';
import {StatusBar, SafeAreaView, StyleSheet} from 'react-native';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {FatigueProvider} from './src/contexts/FatigueContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <FatigueProvider>
          <AppContent />
        </FatigueProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
