/**
 * SedentaryDetector - 앉아있기 자동 감지
 *
 * 가속도 센서를 통해 장시간 움직임 없음을 감지하고
 * 자동으로 SITTING 활동을 기록
 *
 * 설치 필요: npm install react-native-sensors react-native-background-timer
 */

import {AppSettings, SedentaryEvent} from '../types';

// react-native-sensors 설치 후 활성화
// import {accelerometer, SensorTypes, setUpdateIntervalForType} from 'react-native-sensors';
// import BackgroundTimer from 'react-native-background-timer';

const MOTION_THRESHOLD = 0.3; // m/s² - 이 이하면 정지 상태로 판단
const CHECK_INTERVAL_MS = 60000; // 1분마다 앉아있기 체크

export class SedentaryDetector {
  private lastSignificantMotion: Date = new Date();
  private isRunning = false;
  private settings: AppSettings;
  private onSedentaryDetected: (event: SedentaryEvent) => void;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  // private sensorSubscription: any = null;

  constructor(
    settings: AppSettings,
    onSedentaryDetected: (event: SedentaryEvent) => void,
  ) {
    this.settings = settings;
    this.onSedentaryDetected = onSedentaryDetected;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastSignificantMotion = new Date();

    console.log('[SedentaryDetector] 앉아있기 감지 시작');

    // 가속도 센서 구독 (라이브러리 설치 후 활성화)
    // setUpdateIntervalForType(SensorTypes.accelerometer, 5000); // 5초 간격
    // this.sensorSubscription = accelerometer.subscribe(({x, y, z}) => {
    //   const magnitude = Math.sqrt(x * x + y * y + z * z);
    //   const motion = Math.abs(magnitude - 9.8); // 중력 제거
    //
    //   if (motion > MOTION_THRESHOLD) {
    //     this.lastSignificantMotion = new Date();
    //   }
    // });

    // 주기적 앉아있기 체크
    this.checkInterval = setInterval(() => {
      this.checkSedentary();
    }, CHECK_INTERVAL_MS);
  }

  private checkSedentary(): void {
    const now = new Date();
    const hour = now.getHours();

    // 주간 시간대에만 감지
    if (hour < this.settings.daytimeStartHour || hour >= this.settings.daytimeEndHour) {
      return;
    }

    const minutesSinceMotion =
      (now.getTime() - this.lastSignificantMotion.getTime()) / 60000;

    if (minutesSinceMotion >= this.settings.sedentaryThresholdMinutes) {
      const event: SedentaryEvent = {
        startTime: this.lastSignificantMotion,
        endTime: now,
        durationMinutes: Math.round(minutesSinceMotion),
        autoDetected: true,
      };

      console.log(`[SedentaryDetector] 앉아있기 감지: ${event.durationMinutes}분`);
      this.onSedentaryDetected(event);

      // 타이머 리셋 (중복 이벤트 방지)
      this.lastSignificantMotion = now;
    }
  }

  stop(): void {
    this.isRunning = false;
    // this.sensorSubscription?.unsubscribe();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('[SedentaryDetector] 앉아있기 감지 중지');
  }

  updateSettings(settings: AppSettings): void {
    this.settings = settings;
  }

  /** 현재까지 앉아있는 시간(분) 반환 */
  getCurrentSedentaryMinutes(): number {
    const now = new Date();
    return Math.round(
      (now.getTime() - this.lastSignificantMotion.getTime()) / 60000,
    );
  }

  /** 움직임 감지 시 호출 (외부에서 수동으로도 리셋 가능) */
  resetMotionTimer(): void {
    this.lastSignificantMotion = new Date();
  }
}
