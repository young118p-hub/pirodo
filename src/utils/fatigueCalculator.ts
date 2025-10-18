/**
 * 피로도 계산 엔진
 */

import {ActivityRecord, ActivityType, FatigueStats} from '../types';
import {ACTIVITY_TYPE_INFO, RECOMMENDED} from './constants';

/**
 * 활동의 피로도 영향 계산
 */
export const calculateActivityImpact = (activity: ActivityRecord): number => {
  const info = ACTIVITY_TYPE_INFO[activity.type];
  const hours = activity.durationMinutes / 60;
  return info.fatigueWeight * hours * 100;
};

/**
 * 수면 시간 기반 보너스/페널티
 */
const calculateSleepBonus = (activities: ActivityRecord[]): number => {
  const sleepMinutes = activities
    .filter(a => a.type === ActivityType.SLEEP)
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const sleepHours = sleepMinutes / 60;

  if (sleepHours < 5) return 15; // 큰 페널티
  if (sleepHours < 6) return 10; // 페널티
  if (sleepHours >= 7 && sleepHours <= 9) return -10; // 보너스
  if (sleepHours > 9) return 5; // 과도한 수면 페널티
  return 0;
};

/**
 * 활동 균형 페널티
 */
const calculateBalancePenalty = (activities: ActivityRecord[]): number => {
  const workMinutes = activities
    .filter(a => a.type === ActivityType.WORK)
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const restMinutes = activities
    .filter(a => a.type === ActivityType.REST)
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const workHours = workMinutes / 60;
  const restHours = restMinutes / 60;

  // 업무 10시간 이상, 휴식 1시간 미만
  if (workHours > 10 && restHours < 1) {
    return 10;
  }

  return 0;
};

/**
 * 피로도 계산 (0-100)
 */
export const calculateFatigue = (
  activities: ActivityRecord[],
  baselineFatigue: number = 50,
): number => {
  let fatigue = baselineFatigue;

  // 각 활동의 영향 합산
  activities.forEach(activity => {
    fatigue += calculateActivityImpact(activity);
  });

  // 보너스/페널티 적용
  fatigue += calculateSleepBonus(activities);
  fatigue += calculateBalancePenalty(activities);

  // 0-100 범위로 제한
  return Math.max(0, Math.min(100, Math.round(fatigue)));
};

/**
 * 활동별 기여도 계산
 */
export const calculateContributions = (
  activities: ActivityRecord[],
): Map<ActivityType, number> => {
  const contributions = new Map<ActivityType, number>();

  const totalImpact = activities.reduce(
    (sum, a) => sum + Math.abs(calculateActivityImpact(a)),
    0,
  );

  if (totalImpact === 0) return contributions;

  activities.forEach(activity => {
    const impact = Math.abs(calculateActivityImpact(activity));
    const current = contributions.get(activity.type) || 0;
    contributions.set(activity.type, current + (impact / totalImpact) * 100);
  });

  return contributions;
};

/**
 * 재미있는 피로도 메시지 생성
 */
export const getFatigueMessage = (
  fatiguePercentage: number,
  activities: ActivityRecord[],
): string => {
  const sleepHours =
    activities
      .filter(a => a.type === ActivityType.SLEEP)
      .reduce((sum, a) => sum + a.durationMinutes, 0) / 60;

  const screenHours =
    activities
      .filter(a => a.type === ActivityType.SCREEN_TIME)
      .reduce((sum, a) => sum + a.durationMinutes, 0) / 60;

  if (fatiguePercentage >= 90) return '당신의 몸이 파업을 선언했습니다! 🚨';
  if (fatiguePercentage >= 80) return '배터리 10% 남았습니다. 긴급 충전 필요! 🔋';
  if (fatiguePercentage >= 70) return '좀비 모드 활성화 중... 🧟';
  if (fatiguePercentage >= 60) return '커피도 소용없는 수준입니다 ☕😵';
  if (fatiguePercentage >= 50) return '피곤하시죠? 저도 그래요... 😓';
  if (fatiguePercentage >= 30) return '적당히 피곤한 정상인입니다 😊';
  if (fatiguePercentage >= 15) return '완전 충전 상태! 🔋💯';

  if (sleepHours > 10) return '혹시 겨울잠 자는 중이신가요? 🐻';
  if (screenHours < 2) return '디지털 디톡스 성공! 👏';
  return '슈퍼맨이 따로 없네요! 💪✨';
};

/**
 * 추천 행동 제안
 */
export const getRecommendation = (
  fatiguePercentage: number,
  activities: ActivityRecord[],
): string => {
  const sleepHours =
    activities
      .filter(a => a.type === ActivityType.SLEEP)
      .reduce((sum, a) => sum + a.durationMinutes, 0) / 60;

  const exerciseMinutes = activities
    .filter(a => a.type === ActivityType.EXERCISE)
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const screenHours =
    activities
      .filter(a => a.type === ActivityType.SCREEN_TIME)
      .reduce((sum, a) => sum + a.durationMinutes, 0) / 60;

  if (fatiguePercentage > 75)
    return '즉시 휴식이 필요합니다. 15분만 눈을 감아보세요.';
  if (sleepHours < 6) return '오늘은 일찍 주무세요. 최소 7시간 수면을 목표로!';
  if (exerciseMinutes < 30)
    return '가벼운 산책 어떠세요? 20분만 걸어도 좋아요.';
  if (screenHours > 6) return '스크린에서 눈을 떼고 먼 곳을 바라보세요.';
  return '잘하고 계세요! 이대로 유지하세요 👍';
};

/**
 * 특정 활동 타입의 총 시간 계산
 */
export const getTotalMinutesForActivity = (
  activities: ActivityRecord[],
  activityType: ActivityType,
): number => {
  return activities
    .filter(a => a.type === activityType)
    .reduce((sum, a) => sum + a.durationMinutes, 0);
};

/**
 * 피로도 통계 계산
 */
export const calculateFatigueStats = (
  activities: ActivityRecord[],
  fatiguePercentage: number,
): FatigueStats => {
  return {
    totalActivities: activities.length,
    totalFatigueImpact: activities.reduce(
      (sum, a) => sum + calculateActivityImpact(a),
      0,
    ),
    activityContributions: calculateContributions(activities),
    recommendation: getRecommendation(fatiguePercentage, activities),
    fatigueMessage: getFatigueMessage(fatiguePercentage, activities),
  };
};
