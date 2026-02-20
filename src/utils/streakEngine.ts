/**
 * 스트릭(연속 달성) 계산 엔진
 */

import {StreakData} from '../types';

/**
 * 스트릭 보너스 경험치 배율 (1.0 = 보너스 없음)
 * 3일+: 10%, 7일+: 25%, 14일+: 50%, 30일+: 100%
 */
export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 1.0;  // +100%
  if (streak >= 14) return 0.5;  // +50%
  if (streak >= 7) return 0.25;  // +25%
  if (streak >= 3) return 0.1;   // +10%
  return 0;
}

/**
 * 스트릭 보너스 적용된 경험치 계산
 */
export function applyStreakBonus(baseExp: number, streak: number): number {
  const bonus = getStreakBonus(streak);
  return Math.round(baseExp * (1 + bonus));
}

/**
 * 날짜 기반 스트릭 업데이트
 * @param streak 현재 스트릭 데이터
 * @param completedDate 완료한 날짜 (YYYY-MM-DD)
 * @returns 업데이트된 스트릭
 */
export function updateStreak(
  streak: StreakData,
  completedDate: string,
): StreakData {
  const updated = {...streak};

  if (!streak.lastCompletedDate) {
    // 첫 완료
    updated.currentStreak = 1;
    updated.lastCompletedDate = completedDate;
    updated.longestStreak = Math.max(1, streak.longestStreak);
    return updated;
  }

  const lastDate = new Date(streak.lastCompletedDate);
  const currentDate = new Date(completedDate);

  // 밀리초 차이 → 일수
  const diffMs = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 같은 날 또 완료 → 변경 없음
    return updated;
  } else if (diffDays === 1) {
    // 연속일
    updated.currentStreak += 1;
  } else {
    // 끊김 → 리셋
    updated.currentStreak = 1;
  }

  updated.lastCompletedDate = completedDate;
  updated.longestStreak = Math.max(updated.currentStreak, updated.longestStreak);

  return updated;
}

/**
 * 스트릭 보너스 설명 텍스트
 */
export function getStreakBonusLabel(streak: number): string | null {
  const bonus = getStreakBonus(streak);
  if (bonus === 0) return null;
  return `+${Math.round(bonus * 100)}% 보너스`;
}
