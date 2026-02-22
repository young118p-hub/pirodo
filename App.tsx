/**
 * 피로도 앱 메인 파일
 */

import React, {useEffect} from 'react';
import {StatusBar, SafeAreaView, StyleSheet} from 'react-native';
import {NotificationService} from './src/services/NotificationService';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {FatigueProvider} from './src/contexts/FatigueContext';
import {PpoomProvider} from './src/contexts/PpoomContext';
import AppNavigator from './src/navigation/AppNavigator';
import PpoomNotification from './src/components/PpoomNotification';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();

  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
      <PpoomNotification />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <FatigueProvider>
          <PpoomProvider>
            <AppContent />
          </PpoomProvider>
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
