/**
 * 설정 Context - 사용자 설정 저장/관리
 */

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppSettings, InputMode} from '../types';
import {DEFAULT_SETTINGS} from '../utils/constants';

const SETTINGS_STORAGE_KEY = '@pirodo_settings';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setInputMode: (mode: InputMode) => void;
  completeOnboarding: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage에서 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppSettings>;
          // 기존 사용자: onboardingComplete 필드가 없으면 자동 완료 처리
          if (parsed.onboardingComplete === undefined) {
            parsed.onboardingComplete = true;
          }
          setSettings({...DEFAULT_SETTINGS, ...parsed});
        }
      } catch (e) {
        if (__DEV__) console.error('설정 로드 실패:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 설정 저장
  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      if (__DEV__) console.error('설정 저장 실패:', e);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const merged = {...prev, ...partial};

      // 값 범위 검증
      const validated: AppSettings = {
        ...merged,
        sedentaryThresholdMinutes: Math.max(10, Math.min(120, merged.sedentaryThresholdMinutes)),
        daytimeStartHour: Math.max(0, Math.min(23, Math.floor(merged.daytimeStartHour))),
        daytimeEndHour: Math.max(1, Math.min(24, Math.floor(merged.daytimeEndHour))),
      };

      // daytimeStartHour < daytimeEndHour 보장
      if (validated.daytimeStartHour >= validated.daytimeEndHour) {
        validated.daytimeEndHour = Math.min(24, validated.daytimeStartHour + 1);
      }

      saveSettings(validated);
      return validated;
    });
  }, [saveSettings]);

  const setInputMode = useCallback((mode: InputMode) => {
    updateSettings({inputMode: mode});
  }, [updateSettings]);

  const completeOnboarding = useCallback(() => {
    updateSettings({onboardingComplete: true});
  }, [updateSettings]);

  return (
    <SettingsContext.Provider value={{settings, isLoading, updateSettings, setInputMode, completeOnboarding}}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
