/**
 * AppleHealthService - iOS HealthKit 연동 (미구현)
 */

import {IHealthService} from './HealthService';
import {SleepData} from '../types';

export class AppleHealthService implements IHealthService {
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      // return new Promise(resolve => {
      //   AppleHealthKit.isAvailable((err, available) => {
      //     resolve(!err && available);
      //   });
      // });
      return false;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // const permissions: HealthKitPermissions = {
      //   permissions: {
      //     read: [
      //       AppleHealthKit.Constants.Permissions.StepCount,
      //       AppleHealthKit.Constants.Permissions.HeartRate,
      //       AppleHealthKit.Constants.Permissions.HeartRateVariability,
      //       AppleHealthKit.Constants.Permissions.SleepAnalysis,
      //     ],
      //     write: [],
      //   },
      // };
      //
      // return new Promise(resolve => {
      //   AppleHealthKit.initHealthKit(permissions, (err) => {
      //     this.initialized = !err;
      //     resolve(!err);
      //   });
      // });
      return false;
    } catch {
      return false;
    }
  }

  async hasPermissions(): Promise<boolean> {
    return this.initialized;
  }

  async getStepCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      // return new Promise(resolve => {
      //   AppleHealthKit.getStepCount(
      //     {startDate: startDate.toISOString(), endDate: endDate.toISOString()},
      //     (err, results) => {
      //       resolve(err ? 0 : results.value);
      //     },
      //   );
      // });
      return 0;
    } catch {
      return 0;
    }
  }

  async getHeartRate(startDate: Date, endDate: Date): Promise<number | null> {
    try {
      // return new Promise(resolve => {
      //   AppleHealthKit.getHeartRateSamples(
      //     {startDate: startDate.toISOString(), endDate: endDate.toISOString()},
      //     (err, results: HealthValue[]) => {
      //       if (err || results.length === 0) return resolve(null);
      //       const avg = results.reduce((sum, r) => sum + r.value, 0) / results.length;
      //       resolve(Math.round(avg));
      //     },
      //   );
      // });
      return null;
    } catch {
      return null;
    }
  }

  async getHeartRateVariability(startDate: Date, endDate: Date): Promise<number | null> {
    try {
      // return new Promise(resolve => {
      //   AppleHealthKit.getHeartRateVariabilitySamples(
      //     {startDate: startDate.toISOString(), endDate: endDate.toISOString()},
      //     (err, results: HealthValue[]) => {
      //       if (err || results.length === 0) return resolve(null);
      //       const latest = results[results.length - 1];
      //       resolve(Math.round(latest.value * 1000)); // s → ms
      //     },
      //   );
      // });
      return null;
    } catch {
      return null;
    }
  }

  async getSleepData(date: Date): Promise<SleepData | null> {
    try {
      // return new Promise(resolve => {
      //   const startDate = new Date(date);
      //   startDate.setHours(0, 0, 0, 0);
      //
      //   AppleHealthKit.getSleepSamples(
      //     {startDate: startDate.toISOString()},
      //     (err, results) => {
      //       if (err || results.length === 0) return resolve(null);
      //
      //       let totalMinutes = 0;
      //       let deepMinutes = 0;
      //       let remMinutes = 0;
      //
      //       results.forEach(sample => {
      //         const dur = (new Date(sample.endDate).getTime() -
      //           new Date(sample.startDate).getTime()) / 60000;
      //         totalMinutes += dur;
      //         if (sample.value === 'DEEP') deepMinutes += dur;
      //         if (sample.value === 'REM') remMinutes += dur;
      //       });
      //
      //       resolve({
      //         totalMinutes: Math.round(totalMinutes),
      //         deepMinutes: Math.round(deepMinutes),
      //         remMinutes: Math.round(remMinutes),
      //         source: DataSource.APPLE_HEALTH,
      //       });
      //     },
      //   );
      // });
      return null;
    } catch {
      return null;
    }
  }

  async getStressLevel(): Promise<number | null> {
    // Apple HealthKit에는 공식 스트레스 레벨 API가 없음
    // HRV를 기반으로 추정은 가능하지만 별도 계산 필요
    return null;
  }

  disconnect(): void {
    this.initialized = false;
  }
}
