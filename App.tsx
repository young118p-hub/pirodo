/**
 * 피로도 앱 메인 파일
 */

import React from 'react';
import {StatusBar, SafeAreaView, StyleSheet} from 'react-native';
import {SettingsProvider} from './src/contexts/SettingsContext';
import {FatigueProvider} from './src/contexts/FatigueContext';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/utils/theme';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <FatigueProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <AppNavigator />
        </SafeAreaView>
      </FatigueProvider>
    </SettingsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
