/**
 * 일별 피로도 히스토리 저장/조회 서비스
 * AsyncStorage에 최근 30일 데이터 보관
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {DailyHistoryRecord} from '../types';

const HISTORY_KEY = '@pirodo_history';
const MAX_DAYS = 90; // 3개월 보관

export class HistoryService {
  /**
   * 오늘의 데이터를 히스토리에 저장 (덮어쓰기)
   */
  static async saveDailyRecord(record: DailyHistoryRecord): Promise<void> {
    try {
      const history = await this.getHistory();

      // 같은 날짜 데이터가 있으면 교체, 없으면 추가
      const existingIndex = history.findIndex(h => h.date === record.date);
      if (existingIndex >= 0) {
        history[existingIndex] = record;
      } else {
        history.push(record);
      }

      // 오래된 데이터 제거 (최근 30일만)
      const sorted = history
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-MAX_DAYS);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(sorted));
    } catch (error) {
      if (__DEV__) console.error('히스토리 저장 실패:', error);
    }
  }

  /**
   * 전체 히스토리 조회
   */
  static async getHistory(): Promise<DailyHistoryRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      if (__DEV__) console.error('히스토리 로드 실패:', error);
      return [];
    }
  }

  /**
   * 최근 7일 히스토리 조회 (빈 날짜는 null로 채움)
   */
  static async getWeeklyHistory(): Promise<(DailyHistoryRecord | null)[]> {
    const history = await this.getHistory();
    const result: (DailyHistoryRecord | null)[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = history.find(h => h.date === dateStr);
      result.push(record ?? null);
    }

    return result;
  }

  /**
   * 최근 30일 히스토리 조회 (빈 날짜는 null)
   */
  static async getMonthlyHistory(): Promise<(DailyHistoryRecord | null)[]> {
    const history = await this.getHistory();
    const result: (DailyHistoryRecord | null)[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const record = history.find(h => h.date === dateStr);
      result.push(record ?? null);
    }

    return result;
  }

  /**
   * 시간대별 피로도 패턴 조회 (최근 7일 활동 기록 기반)
   */
  static getHourlyPattern(
    activities: Array<{timestamp: Date; type: string; durationMinutes: number}>,
  ): number[] {
    // 24시간 슬롯: 각 시간대에 기록된 활동의 피로 가중치 합산
    const hourlyImpact = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);

    for (const act of activities) {
      const hour = new Date(act.timestamp).getHours();
      hourlyCounts[hour] += 1;
      // 피로 증가 활동이면 양수, 회복이면 음수
      const isFatigue = ['WORK', 'SCREEN_TIME', 'SITTING', 'STRESS', 'CAFFEINE'].includes(act.type);
      hourlyImpact[hour] += isFatigue ? act.durationMinutes : -act.durationMinutes * 0.5;
    }

    return hourlyImpact;
  }

  /**
   * 주간 통계 계산
   */
  static async getWeeklyStats(): Promise<{
    avgFatigue: number;
    maxFatigue: number;
    minFatigue: number;
    avgSleep: number;
    avgSteps: number;
    worstDay: string;
    dataCount: number;
  }> {
    const weekly = await this.getWeeklyHistory();
    const records = weekly.filter((r): r is DailyHistoryRecord => r !== null);

    if (records.length === 0) {
      return {
        avgFatigue: 0,
        maxFatigue: 0,
        minFatigue: 0,
        avgSleep: 0,
        avgSteps: 0,
        worstDay: '-',
        dataCount: 0,
      };
    }

    const fatigues = records.map(r => r.fatiguePercentage);
    const avgFatigue = Math.round(
      fatigues.reduce((a, b) => a + b, 0) / fatigues.length,
    );
    const maxFatigue = Math.max(...fatigues);
    const minFatigue = Math.min(...fatigues);
    const avgSleep = Math.round(
      (records.reduce((a, r) => a + r.sleepHours, 0) / records.length) * 10,
    ) / 10;
    const avgSteps = Math.round(
      records.reduce((a, r) => a + r.stepCount, 0) / records.length,
    );

    const worstRecord = records.reduce((max, r) =>
      r.fatiguePercentage > max.fatiguePercentage ? r : max,
    );
    const worstDate = new Date(worstRecord.date);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const worstDay = dayNames[worstDate.getDay()] + '요일';

    return {
      avgFatigue,
      maxFatigue,
      minFatigue,
      avgSleep,
      avgSteps,
      worstDay,
      dataCount: records.length,
    };
  }
}
