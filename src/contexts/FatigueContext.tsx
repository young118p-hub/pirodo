/**
 * 피로도 데이터 관리를 위한 Context
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityRecord, ActivityType, DailyFatigueData} from '../types';
import {calculateFatigue, calculateFatigueStats} from '../utils/fatigueCalculator';

interface FatigueContextType {
  dailyData: DailyFatigueData;
  fatiguePercentage: number;
  fatigueMessage: string;
  recommendation: string;
  isLoading: boolean;
  addActivity: (
    activityType: ActivityType,
    durationMinutes: number,
    note?: string,
  ) => void;
  removeActivity: (activityId: string) => void;
  clearAllActivities: () => void;
  getTotalMinutesForActivity: (activityType: ActivityType) => number;
}

const FatigueContext = createContext<FatigueContextType | undefined>(
  undefined,
);

const STORAGE_KEY = '@pirodo_daily_data';

export const FatigueProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [dailyData, setDailyData] = useState<DailyFatigueData>({
    date: new Date().toISOString().split('T')[0],
    activities: [],
    currentFatiguePercentage: 50,
  });

  const [fatiguePercentage, setFatiguePercentage] = useState(50);
  const [fatigueMessage, setFatigueMessage] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 날짜 변경 체크 (자정에 데이터 초기화)
  useEffect(() => {
    const checkDate = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (dailyData.date !== today) {
        resetDailyData();
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(checkDate);
  }, [dailyData.date]);

  // 데이터 변경 시 피로도 재계산
  useEffect(() => {
    if (!isLoading) {
      updateFatigue();
      saveData();
    }
  }, [dailyData.activities]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];

        // 데이터 검증: 필수 필드 확인
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !parsed.date ||
          !Array.isArray(parsed.activities)
        ) {
          console.warn('Invalid stored data format, resetting...');
          resetDailyData();
          return;
        }

        // 저장된 날짜가 오늘이 아니면 초기화
        if (parsed.date === today) {
          // timestamp를 Date 객체로 변환 및 활동 데이터 검증
          const activities = parsed.activities
            .filter((a: any) => {
              // 필수 필드 검증
              return (
                a &&
                typeof a === 'object' &&
                a.id &&
                a.type &&
                typeof a.durationMinutes === 'number' &&
                a.durationMinutes >= 0 &&
                a.timestamp
              );
            })
            .map((a: any) => ({
              ...a,
              timestamp: new Date(a.timestamp),
            }));
          setDailyData({...parsed, activities});
        } else {
          resetDailyData();
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // JSON 파싱 실패 시 초기화
      resetDailyData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dailyData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const resetDailyData = () => {
    const newData: DailyFatigueData = {
      date: new Date().toISOString().split('T')[0],
      activities: [],
      currentFatiguePercentage: 50,
    };
    setDailyData(newData);
  };

  const updateFatigue = () => {
    const calculated = calculateFatigue(dailyData.activities, 50);
    const stats = calculateFatigueStats(dailyData.activities, calculated);

    setFatiguePercentage(calculated);
    setFatigueMessage(stats.fatigueMessage);
    setRecommendation(stats.recommendation);

    setDailyData(prev => ({
      ...prev,
      currentFatiguePercentage: calculated,
    }));
  };

  const addActivity = (
    activityType: ActivityType,
    durationMinutes: number,
    note?: string,
  ) => {
    const newActivity: ActivityRecord = {
      id: Date.now().toString(),
      type: activityType,
      durationMinutes,
      timestamp: new Date(),
      note,
    };

    setDailyData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
  };

  const removeActivity = (activityId: string) => {
    setDailyData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== activityId),
    }));
  };

  const clearAllActivities = () => {
    setDailyData(prev => ({
      ...prev,
      activities: [],
    }));
  };

  const getTotalMinutesForActivity = (activityType: ActivityType): number => {
    return dailyData.activities
      .filter(a => a.type === activityType)
      .reduce((sum, a) => sum + a.durationMinutes, 0);
  };

  return (
    <FatigueContext.Provider
      value={{
        dailyData,
        fatiguePercentage,
        fatigueMessage,
        recommendation,
        isLoading,
        addActivity,
        removeActivity,
        clearAllActivities,
        getTotalMinutesForActivity,
      }}>
      {children}
    </FatigueContext.Provider>
  );
};

export const useFatigue = (): FatigueContextType => {
  const context = useContext(FatigueContext);
  if (!context) {
    throw new Error('useFatigue must be used within FatigueProvider');
  }
  return context;
};
