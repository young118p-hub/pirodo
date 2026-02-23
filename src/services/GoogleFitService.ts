/**
 * GoogleFitService - Android Health Connect 연동 (미구현)
 */

import {IHealthService} from './HealthService';
import {SleepData} from '../types';

export class GoogleFitService implements IHealthService {
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      // const status = await getSdkStatus();
      // return status === SdkAvailabilityStatus.SDK_AVAILABLE;
      return false;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // const permissions = [
      //   {accessType: 'read', recordType: 'Steps'},
      //   {accessType: 'read', recordType: 'HeartRate'},
      //   {accessType: 'read', recordType: 'SleepSession'},
      //   {accessType: 'read', recordType: 'HeartRateVariabilityRmssd'},
      // ];
      // const granted = await requestPermission(permissions);
      // return granted.length > 0;
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
      // const result = await readRecords('Steps', {
      //   timeRangeFilter: {
      //     operator: 'between',
      //     startTime: startDate.toISOString(),
      //     endTime: endDate.toISOString(),
      //   },
      // });
      // return result.reduce((sum, r) => sum + r.count, 0);
      return 0;
    } catch {
      return 0;
    }
  }

  async getHeartRate(startDate: Date, endDate: Date): Promise<number | null> {
    try {
      // const result = await readRecords('HeartRate', {
      //   timeRangeFilter: {
      //     operator: 'between',
      //     startTime: startDate.toISOString(),
      //     endTime: endDate.toISOString(),
      //   },
      // });
      // if (result.length === 0) return null;
      // const avg = result.reduce((sum, r) =>
      //   sum + r.samples.reduce((s, sample) => s + sample.beatsPerMinute, 0) / r.samples.length
      // , 0) / result.length;
      // return Math.round(avg);
      return null;
    } catch {
      return null;
    }
  }

  async getHeartRateVariability(startDate: Date, endDate: Date): Promise<number | null> {
    try {
      // const result = await readRecords('HeartRateVariabilityRmssd', {
      //   timeRangeFilter: {
      //     operator: 'between',
      //     startTime: startDate.toISOString(),
      //     endTime: endDate.toISOString(),
      //   },
      // });
      // if (result.length === 0) return null;
      // const latest = result[result.length - 1];
      // return latest.heartRateVariabilityMillis;
      return null;
    } catch {
      return null;
    }
  }

  async getSleepData(date: Date): Promise<SleepData | null> {
    try {
      // const startOfDay = new Date(date);
      // startOfDay.setHours(0, 0, 0, 0);
      // const endOfDay = new Date(date);
      // endOfDay.setHours(23, 59, 59, 999);
      //
      // const result = await readRecords('SleepSession', {
      //   timeRangeFilter: {
      //     operator: 'between',
      //     startTime: startOfDay.toISOString(),
      //     endTime: endOfDay.toISOString(),
      //   },
      // });
      //
      // if (result.length === 0) return null;
      //
      // let totalMinutes = 0;
      // let deepMinutes = 0;
      // let lightMinutes = 0;
      // let remMinutes = 0;
      //
      // result.forEach(session => {
      //   const start = new Date(session.startTime);
      //   const end = new Date(session.endTime);
      //   totalMinutes += (end.getTime() - start.getTime()) / 60000;
      //   session.stages?.forEach(stage => {
      //     const dur = (new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / 60000;
      //     if (stage.stage === 4) deepMinutes += dur;
      //     if (stage.stage === 5) lightMinutes += dur;
      //     if (stage.stage === 6) remMinutes += dur;
      //   });
      // });
      //
      // return {
      //   totalMinutes: Math.round(totalMinutes),
      //   deepMinutes: Math.round(deepMinutes),
      //   lightMinutes: Math.round(lightMinutes),
      //   remMinutes: Math.round(remMinutes),
      //   source: DataSource.GOOGLE_FIT,
      // };
      return null;
    } catch {
      return null;
    }
  }

  async getStressLevel(): Promise<number | null> {
    // Samsung Health 스트레스 데이터는 Health Connect를 통해 접근 가능할 수 있음
    // 현재 Health Connect API에 공식 스트레스 레코드 타입은 없음
    // Samsung Health SDK 직접 연동 필요
    return null;
  }

  disconnect(): void {
    this.initialized = false;
  }
}
