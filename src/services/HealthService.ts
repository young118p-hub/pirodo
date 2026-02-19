/**
 * HealthService 추상 인터페이스 + 팩토리
 */

import {Platform} from 'react-native';
import {InputMode, SleepData, DataSource} from '../types';

export interface IHealthService {
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  hasPermissions(): Promise<boolean>;
  getStepCount(startDate: Date, endDate: Date): Promise<number>;
  getHeartRate(startDate: Date, endDate: Date): Promise<number | null>;
  getHeartRateVariability(startDate: Date, endDate: Date): Promise<number | null>;
  getSleepData(date: Date): Promise<SleepData | null>;
  getStressLevel(): Promise<number | null>;
  disconnect(): void;
}

export function createHealthService(inputMode: InputMode): IHealthService {
  if (inputMode === InputMode.MANUAL) {
    const {NullHealthService} = require('./NullHealthService');
    return new NullHealthService();
  }

  // AUTO 모드: 플랫폼별 건강 서비스 (워치+폰 데이터 통합)
  if (Platform.OS === 'ios') {
    const {AppleHealthService} = require('./AppleHealthService');
    return new AppleHealthService();
  }

  const {GoogleFitService} = require('./GoogleFitService');
  return new GoogleFitService();
}
