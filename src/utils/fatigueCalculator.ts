/**
 * 피로도 계산 엔진
 */

import {
  ActivityRecord,
  ActivityType,
  FatigueStats,
  HealthDataSnapshot,
  SedentaryEvent,
  InputMode,
  DataSource,
  SleepData,
} from '../types';
import {ACTIVITY_TYPE_INFO, RECOMMENDED, HEALTH_WEIGHTS} from './constants';

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

// =============================================
// V2: 건강 데이터 기반 피로도 계산
// =============================================

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, Math.round(value)));

/**
 * 심박수/HRV 기반 심혈관 영향 (-13 ~ +22)
 */
const calculateCardiovascularImpact = (
  heartRate: number,
  hrv: number,
): number => {
  let impact = 0;

  // 심박수: 높으면 피로, 낮으면 회복
  if (heartRate > 90) impact += 10;
  else if (heartRate > HEALTH_WEIGHTS.HR_RESTING_HIGH) impact += 5;
  else if (heartRate < 55) impact -= 8;
  else if (heartRate < HEALTH_WEIGHTS.HR_RESTING_LOW) impact -= 5;

  // HRV: 높으면 회복 좋음, 낮으면 스트레스
  if (hrv > 60) impact -= 8;
  else if (hrv > HEALTH_WEIGHTS.HRV_GOOD) impact -= 5;
  else if (hrv < 20) impact += 12;
  else if (hrv < HEALTH_WEIGHTS.HRV_POOR) impact += 8;

  return impact;
};

/**
 * Samsung 스트레스 레벨 영향 (-5 ~ +12)
 */
const calculateStressImpact = (stressLevel: number): number => {
  if (stressLevel > 80) return 12;
  if (stressLevel > 60) return 8;
  if (stressLevel > 40) return 3;
  if (stressLevel < 20) return -5;
  return 0;
};

/**
 * 걸음수 영향 (-8 ~ +8)
 */
const calculateStepImpact = (steps: number): number => {
  if (steps < 2000) return 8;      // 매우 비활동적
  if (steps < 4000) return 3;      // 평균 이하
  if (steps >= 5000 && steps <= 10000) return -8;  // 건강 범위
  if (steps >= 10000 && steps <= 15000) return -5;  // 활동적
  if (steps > 15000) return 3;     // 과도한 활동
  return 0;
};

/**
 * 수면 데이터 영향 (통합: 워치/폰/수동) (-15 ~ +25)
 */
const calculateSleepImpactV2 = (
  activities: ActivityRecord[],
  healthData: HealthDataSnapshot | null,
): number => {
  // 우선순위: 워치 수면 > 폰 추정 수면 > 수동 입력
  const sleepData = healthData?.sleepData ?? healthData?.estimatedSleepData;

  if (sleepData) {
    const hours = sleepData.totalMinutes / 60;
    let impact = 0;

    if (hours < 4) impact = 25;
    else if (hours < 5) impact = 15;
    else if (hours < 6) impact = 10;
    else if (hours >= HEALTH_WEIGHTS.SLEEP_OPTIMAL_MIN &&
             hours <= HEALTH_WEIGHTS.SLEEP_OPTIMAL_MAX) impact = -15;
    else if (hours > 10) impact = 5;

    // 깊은 수면 비율 보너스 (워치 전용)
    if (sleepData.deepMinutes && sleepData.totalMinutes > 0) {
      const deepRatio = sleepData.deepMinutes / sleepData.totalMinutes;
      if (deepRatio > 0.20) impact -= 5;
      else if (deepRatio < 0.10) impact += 5;
    }

    return impact;
  }

  // 수동 수면 활동 기록 fallback
  return calculateSleepBonus(activities);
};

/**
 * V2 피로도 계산 (건강 데이터 통합)
 */
export const calculateFatigueV2 = (
  activities: ActivityRecord[],
  healthData: HealthDataSnapshot | null,
  sedentaryEvents: SedentaryEvent[],
  manualSliderValue: number | null,
  inputMode: InputMode,
  baselineFatigue: number = 50,
): number => {
  // Tier C: 슬라이더 기반
  if (inputMode === InputMode.MANUAL && manualSliderValue !== null) {
    let fatigue = manualSliderValue;

    // 수동 활동 보정 (감쇄 적용)
    activities
      .filter(a => a.source === DataSource.MANUAL_ACTIVITY || !a.source)
      .forEach(activity => {
        fatigue += calculateActivityImpact(activity) * 0.5;
      });

    return clamp(fatigue, 0, 100);
  }

  // Tier A/B: 자동 데이터 기반
  let fatigue = baselineFatigue;

  // 1. 수면 영향
  fatigue += calculateSleepImpactV2(activities, healthData);

  // 2. 심박수/HRV (워치 전용)
  if (healthData?.heartRate != null && healthData?.heartRateVariability != null) {
    fatigue += calculateCardiovascularImpact(
      healthData.heartRate,
      healthData.heartRateVariability,
    );
  }

  // 3. 스트레스 레벨 (삼성 워치)
  if (healthData?.stressLevel != null) {
    fatigue += calculateStressImpact(healthData.stressLevel);
  }

  // 4. 걸음수
  const stepCount = healthData?.stepCount ?? 0;
  if (stepCount > 0) {
    fatigue += calculateStepImpact(stepCount);
  }

  // 5. 앉아있기 자동 감지
  const totalSedentaryMinutes = sedentaryEvents.reduce(
    (sum, e) => sum + e.durationMinutes,
    0,
  );
  fatigue += (totalSedentaryMinutes / 60) * HEALTH_WEIGHTS.SEDENTARY_PER_HOUR;

  // 6. 스크린타임
  if (healthData?.screenTimeMinutes) {
    fatigue += (healthData.screenTimeMinutes / 60) * HEALTH_WEIGHTS.SCREEN_TIME_PER_HOUR;
  }

  // 7. 수동 활동 보충
  activities
    .filter(a => a.source === DataSource.MANUAL_ACTIVITY || !a.source)
    .forEach(activity => {
      fatigue += calculateActivityImpact(activity);
    });

  // 8. 균형 패널티
  fatigue += calculateBalancePenalty(activities);

  return clamp(fatigue, 0, 100);
};
