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

  if (Platform.OS === 'ios') {
    const {AppleHealthService} = require('./AppleHealthService');
    return new AppleHealthService();
  }

  // Android: Health Connect (Galaxy Watch 데이터도 포함)
  const {GoogleFitService} = require('./GoogleFitService');
  return new GoogleFitService();
}
