/**
 * SedentaryDetector - 앉아있기 자동 감지 (개선판)
 *
 * 다중 신호 기반 감지:
 * 1. AppState 변화 (앱 전환 = 폰 사용 = 움직임 가능성)
 * 2. 스텝 카운트 변화 (걸음 증가 → 확실한 움직임)
 * 3. 사용자 활동 기록 (수동 입력 → 움직임)
 * 4. 단계별 알림 (30분, 60분, 90분)
 */

import {AppState, AppStateStatus} from 'react-native';
import {AppSettings, SedentaryEvent} from '../types';

const CHECK_INTERVAL_MS = 60000; // 1분마다 체크
const ALERT_STAGES = [30, 60, 90]; // 단계별 알림 (분)

export class SedentaryDetector {
  private lastSignificantMotion: Date = new Date();
  private lastStepCount: number = 0;
  private isRunning = false;
  private settings: AppSettings;
  private onSedentaryDetected: (event: SedentaryEvent) => void;
  private onSedentaryAlert?: (minutes: number, stage: number) => void;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private alertedStages: Set<number> = new Set();

  constructor(
    settings: AppSettings,
    onSedentaryDetected: (event: SedentaryEvent) => void,
    onSedentaryAlert?: (minutes: number, stage: number) => void,
  ) {
    this.settings = settings;
    this.onSedentaryDetected = onSedentaryDetected;
    this.onSedentaryAlert = onSedentaryAlert;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastSignificantMotion = new Date();
    this.alertedStages.clear();

    console.log('[SedentaryDetector] 앉아있기 감지 시작 (개선판)');

    // AppState 모니터링 - 앱이 foreground로 오면 폰을 사용 중 = 어느정도 움직임
    this.appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // 앱이 활성화됨 → 짧은 움직임 감지 (완전 리셋 아닌 부분 리셋)
        // 폰을 들어올린 것 자체는 큰 움직임이 아니므로 5분만 연장
        const now = new Date();
        const minutesSince = (now.getTime() - this.lastSignificantMotion.getTime()) / 60000;
        if (minutesSince > 5) {
          // 5분 이상 지났을 때만 부분 연장 (5분 뒤로)
          this.lastSignificantMotion = new Date(now.getTime() - 5 * 60000);
        }
      }
    });

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

    // 단계별 알림 발송
    for (let i = 0; i < ALERT_STAGES.length; i++) {
      const stage = ALERT_STAGES[i];
      if (minutesSinceMotion >= stage && !this.alertedStages.has(stage)) {
        this.alertedStages.add(stage);
        this.onSedentaryAlert?.(Math.round(minutesSinceMotion), i + 1);
      }
    }

    // 임계값 초과 시 앉아있기 이벤트 발생
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
      this.alertedStages.clear();
    }
  }

  /**
   * 스텝 카운트 업데이트 - 걸음이 증가하면 움직임으로 판단
   */
  updateStepCount(steps: number): void {
    if (steps > this.lastStepCount + 10) {
      // 10걸음 이상 증가 → 확실한 움직임
      this.resetMotionTimer();
    }
    this.lastStepCount = steps;
  }

  /**
   * 사용자가 활동을 기록하면 움직임으로 간주
   */
  onUserActivity(): void {
    this.resetMotionTimer();
  }

  stop(): void {
    this.isRunning = false;
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
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
    this.alertedStages.clear();
  }

  /** 현재 알림 단계 반환 (0=정상, 1-3=단계별 경고) */
  getCurrentAlertStage(): number {
    const minutes = this.getCurrentSedentaryMinutes();
    for (let i = ALERT_STAGES.length - 1; i >= 0; i--) {
      if (minutes >= ALERT_STAGES[i]) return i + 1;
    }
    return 0;
  }
}
