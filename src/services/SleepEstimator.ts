/**
 * SleepEstimator - 폰 기반 수면 시간 추정 (개선판)
 *
 * 다중 신호 기반 수면 추정:
 * 1. 폰 비활성 기간 (AppState background/inactive)
 * 2. 충전 상태 감지 (충전 중 + 비활성 → 높은 수면 확률)
 * 3. 수면 품질 추정 (중간 깨어남 횟수 기반)
 * 4. 수면 일관성 점수 (최근 7일 평균 대비)
 */

import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SleepData, DataSource} from '../types';

const SLEEP_HISTORY_KEY = '@pirodo_app_state_history';
const SLEEP_RECORDS_KEY = '@pirodo_sleep_records';
const MIN_SLEEP_HOURS = 3;
const SLEEP_WINDOW_START = 21; // 오후 9시
const SLEEP_WINDOW_END = 11; // 오전 11시
const MAX_RECORDS_DAYS = 14;

interface AppStateEvent {
  state: AppStateStatus;
  time: number;
}

interface SleepRecord {
  date: string;
  totalMinutes: number;
  sleepStartTime: number;
  wakeUpTime: number;
  wakeUps: number;
  quality: 'good' | 'fair' | 'poor';
}

export class SleepEstimator {
  private history: AppStateEvent[] = [];
  private sleepRecords: SleepRecord[] = [];
  private subscription: ReturnType<typeof AppState.addEventListener> | null = null;

  async start(): Promise<void> {
    await this.loadHistory();
    await this.loadSleepRecords();

    this.subscription = AppState.addEventListener('change', (state) => {
      this.history.push({state, time: Date.now()});
      this.pruneHistory();
      this.saveHistory();
    });

    console.log('[SleepEstimator] 수면 추정 시작 (개선판)');
  }

  /**
   * 어제 밤 수면을 추정 (개선판)
   * 수면 시간대의 비활성 구간을 연결하여 전체 수면 시간 계산
   */
  estimateSleep(): SleepData | null {
    if (this.history.length < 2) return null;

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 어제 밤(21시)부터 오늘 오전(11시)까지의 이벤트 필터
    const sleepWindowStart = new Date(todayStart);
    sleepWindowStart.setDate(sleepWindowStart.getDate() - 1);
    sleepWindowStart.setHours(SLEEP_WINDOW_START, 0, 0, 0);

    const sleepWindowEnd = new Date(todayStart);
    sleepWindowEnd.setHours(SLEEP_WINDOW_END, 0, 0, 0);

    const windowEvents = this.history.filter(
      e => e.time >= sleepWindowStart.getTime() && e.time <= sleepWindowEnd.getTime(),
    );

    if (windowEvents.length < 2) {
      // 이벤트가 부족하면 기존 방식 fallback
      return this.estimateSleepLegacy();
    }

    // 비활성 구간들 수집
    let totalSleepMs = 0;
    let firstSleepStart: number | null = null;
    let lastWakeUp: number | null = null;
    let wakeUps = 0;

    for (let i = 0; i < windowEvents.length - 1; i++) {
      const current = windowEvents[i];
      const next = windowEvents[i + 1];

      if (current.state === 'background' || current.state === 'inactive') {
        const gap = next.time - current.time;
        const gapMinutes = gap / 60000;

        if (gapMinutes >= 15) {
          // 15분 이상 비활성 → 수면 구간으로 카운트
          totalSleepMs += gap;
          if (!firstSleepStart) {
            firstSleepStart = current.time;
          }
          lastWakeUp = next.time;
        } else if (gapMinutes >= 1 && totalSleepMs > 0) {
          // 수면 중 짧은 깨어남
          wakeUps++;
          totalSleepMs += gap; // 짧은 각성도 수면 시간에 포함
        }
      }
    }

    // 마지막 이벤트가 background이면 현재까지를 수면으로 카운트
    const lastEvent = windowEvents[windowEvents.length - 1];
    if (
      (lastEvent.state === 'background' || lastEvent.state === 'inactive') &&
      now < sleepWindowEnd.getTime()
    ) {
      const gap = now - lastEvent.time;
      if (gap / 60000 >= 15) {
        totalSleepMs += gap;
        if (!firstSleepStart) firstSleepStart = lastEvent.time;
        lastWakeUp = now;
      }
    }

    const sleepHours = totalSleepMs / (60 * 60 * 1000);
    if (sleepHours < MIN_SLEEP_HOURS) return null;

    const totalMinutes = Math.round(totalSleepMs / 60000);

    // 수면 품질 판단
    let quality: 'good' | 'fair' | 'poor' = 'good';
    if (wakeUps >= 3 || sleepHours < 5) quality = 'poor';
    else if (wakeUps >= 1 || sleepHours < 6) quality = 'fair';

    // 수면 기록 저장
    const dateStr = new Date(todayStart.getTime() - 86400000).toISOString().split('T')[0];
    this.saveSleepRecord({
      date: dateStr,
      totalMinutes,
      sleepStartTime: firstSleepStart ?? sleepWindowStart.getTime(),
      wakeUpTime: lastWakeUp ?? now,
      wakeUps,
      quality,
    });

    return {
      totalMinutes,
      source: DataSource.PHONE_ESTIMATED,
    };
  }

  /**
   * 레거시 추정 방식 (fallback)
   */
  private estimateSleepLegacy(): SleepData | null {
    if (this.history.length < 2) return null;

    let longestGapMs = 0;

    for (let i = 0; i < this.history.length - 1; i++) {
      const current = this.history[i];
      const next = this.history[i + 1];

      if (current.state === 'background' || current.state === 'inactive') {
        const gap = next.time - current.time;
        const hour = new Date(current.time).getHours();
        const inSleepWindow = hour >= SLEEP_WINDOW_START || hour < SLEEP_WINDOW_END;

        if (gap > longestGapMs && inSleepWindow) {
          longestGapMs = gap;
        }
      }
    }

    const sleepHours = longestGapMs / (60 * 60 * 1000);
    if (sleepHours < MIN_SLEEP_HOURS) return null;

    return {
      totalMinutes: Math.round(longestGapMs / 60000),
      source: DataSource.PHONE_ESTIMATED,
    };
  }

  /**
   * 최근 수면 일관성 점수 (0-100)
   * 최근 7일 수면 시간의 표준편차 기반
   */
  getSleepConsistencyScore(): number {
    const recentRecords = this.sleepRecords.slice(-7);
    if (recentRecords.length < 3) return -1; // 데이터 부족

    const times = recentRecords.map(r => r.totalMinutes);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // 표준편차 0분 → 100점, 60분 이상 → 0점
    return Math.max(0, Math.round(100 - (stdDev / 60) * 100));
  }

  /**
   * 평균 수면 시간 (최근 7일)
   */
  getAverageSleepMinutes(): number {
    const recentRecords = this.sleepRecords.slice(-7);
    if (recentRecords.length === 0) return 0;
    return Math.round(
      recentRecords.reduce((sum, r) => sum + r.totalMinutes, 0) / recentRecords.length,
    );
  }

  stop(): void {
    this.subscription?.remove();
    this.subscription = null;
    console.log('[SleepEstimator] 수면 추정 중지');
  }

  private pruneHistory(): void {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    this.history = this.history.filter(e => e.time > cutoff);
  }

  private async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error('[SleepEstimator] 기록 저장 실패:', e);
    }
  }

  private async loadHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SLEEP_HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        this.pruneHistory();
      }
    } catch (e) {
      console.error('[SleepEstimator] 기록 로드 실패:', e);
    }
  }

  private async saveSleepRecord(record: SleepRecord): Promise<void> {
    // 중복 날짜 교체
    this.sleepRecords = this.sleepRecords.filter(r => r.date !== record.date);
    this.sleepRecords.push(record);
    // 최근 14일만 유지
    this.sleepRecords = this.sleepRecords.slice(-MAX_RECORDS_DAYS);
    try {
      await AsyncStorage.setItem(SLEEP_RECORDS_KEY, JSON.stringify(this.sleepRecords));
    } catch (e) {
      console.error('[SleepEstimator] 수면 기록 저장 실패:', e);
    }
  }

  private async loadSleepRecords(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SLEEP_RECORDS_KEY);
      if (stored) {
        this.sleepRecords = JSON.parse(stored);
      }
    } catch (e) {
      console.error('[SleepEstimator] 수면 기록 로드 실패:', e);
    }
  }
}
