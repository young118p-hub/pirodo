/**
 * SleepEstimator - 폰 기반 수면 시간 추정
 *
 * 폰 사용 패턴(AppState 변화)으로 수면 시간을 추정
 * 마지막 폰 사용 → 첫 폰 사용 시간차 = 대략적인 수면 시간
 */

import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SleepData, DataSource} from '../types';

const SLEEP_HISTORY_KEY = '@pirodo_app_state_history';
const MIN_SLEEP_HOURS = 3; // 3시간 미만은 수면으로 간주 안 함
const SLEEP_WINDOW_START = 21; // 오후 9시
const SLEEP_WINDOW_END = 11; // 오전 11시

interface AppStateEvent {
  state: AppStateStatus;
  time: number; // timestamp
}

export class SleepEstimator {
  private history: AppStateEvent[] = [];
  private subscription: ReturnType<typeof AppState.addEventListener> | null = null;

  async start(): Promise<void> {
    // 이전 기록 로드
    await this.loadHistory();

    // AppState 변화 구독
    this.subscription = AppState.addEventListener('change', (state) => {
      this.history.push({state, time: Date.now()});
      this.pruneHistory();
      this.saveHistory();
    });

    console.log('[SleepEstimator] 수면 추정 시작');
  }

  /**
   * 어제 밤 수면을 추정
   * 가장 긴 비활성 기간(background/inactive)을 찾아 수면으로 간주
   */
  estimateSleep(): SleepData | null {
    if (this.history.length < 2) return null;

    let longestGapMs = 0;
    let gapStart: number | null = null;

    for (let i = 0; i < this.history.length - 1; i++) {
      const current = this.history[i];
      const next = this.history[i + 1];

      // background/inactive 상태로 전환된 시점 ~ 다시 active로 돌아온 시점
      if (current.state === 'background' || current.state === 'inactive') {
        const gap = next.time - current.time;
        const hour = new Date(current.time).getHours();

        // 수면 시간대(21시~11시) 내의 긴 비활성만 수면으로 간주
        const inSleepWindow = hour >= SLEEP_WINDOW_START || hour < SLEEP_WINDOW_END;

        if (gap > longestGapMs && inSleepWindow) {
          longestGapMs = gap;
          gapStart = current.time;
        }
      }
    }

    // 최소 수면 시간 체크
    const sleepHours = longestGapMs / (60 * 60 * 1000);
    if (sleepHours < MIN_SLEEP_HOURS) return null;

    return {
      totalMinutes: Math.round(longestGapMs / 60000),
      source: DataSource.PHONE_ESTIMATED,
    };
  }

  stop(): void {
    this.subscription?.remove();
    this.subscription = null;
    console.log('[SleepEstimator] 수면 추정 중지');
  }

  private pruneHistory(): void {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000; // 48시간만 유지
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
}
