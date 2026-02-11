/**
 * NullHealthService - Manual 모드용 no-op 구현
 */

import {IHealthService} from './HealthService';
import {SleepData} from '../types';

export class NullHealthService implements IHealthService {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async hasPermissions(): Promise<boolean> {
    return true;
  }

  async getStepCount(): Promise<number> {
    return 0;
  }

  async getHeartRate(): Promise<number | null> {
    return null;
  }

  async getHeartRateVariability(): Promise<number | null> {
    return null;
  }

  async getSleepData(): Promise<SleepData | null> {
    return null;
  }

  async getStressLevel(): Promise<number | null> {
    return null;
  }

  disconnect(): void {}
}
