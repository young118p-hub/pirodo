/**
 * 회복 추천 엔진
 * 피로도 원인을 분석하고 맞춤 회복 팁을 제공
 */

import {ActivityRecord, ActivityType, HealthDataSnapshot, RecoveryTip} from '../types';
import {HEALTH_WEIGHTS} from './constants';

export function getRecoveryTips(
  fatiguePercentage: number,
  healthData: HealthDataSnapshot | null,
  activities: ActivityRecord[],
): RecoveryTip[] {
  const tips: RecoveryTip[] = [];

  // 수면 부족 체크
  const sleepData = healthData?.sleepData ?? healthData?.estimatedSleepData;
  const sleepHours = sleepData ? sleepData.totalMinutes / 60 : 0;
  const sleepActivities = activities.filter(a => a.type === ActivityType.SLEEP);
  const manualSleepHours = sleepActivities.reduce(
    (sum, a) => sum + a.durationMinutes,
    0,
  ) / 60;
  const totalSleep = sleepData ? sleepHours : manualSleepHours;

  if (totalSleep > 0 && totalSleep < HEALTH_WEIGHTS.SLEEP_OPTIMAL_MIN) {
    tips.push({
      emoji: '😴',
      title: '수면 부족',
      description: `${totalSleep.toFixed(1)}시간 수면. 7시간 이상 자면 내일 컨디션이 달라져요.`,
      priority: 1,
    });
  }

  // 장시간 앉아있기 체크
  const sittingMinutes = activities
    .filter(a => a.type === ActivityType.SITTING)
    .reduce((sum, a) => sum + a.durationMinutes, 0);
  if (sittingMinutes >= 60) {
    tips.push({
      emoji: '🚶',
      title: '움직임 필요',
      description: `${Math.round(sittingMinutes / 60)}시간 앉아있었어요. 10분 산책 어때요?`,
      priority: 2,
    });
  }

  // 스크린타임 과다
  const screenMinutes = activities
    .filter(a => a.type === ActivityType.SCREEN_TIME)
    .reduce((sum, a) => sum + a.durationMinutes, 0);
  if (screenMinutes >= 180) {
    tips.push({
      emoji: '👀',
      title: '눈 휴식',
      description: '스크린을 오래 봤어요. 20-20-20 규칙을 실천해보세요.',
      priority: 3,
    });
  }

  // 걸음수 부족
  const steps = healthData?.stepCount ?? 0;
  if (steps > 0 && steps < HEALTH_WEIGHTS.STEP_GOAL * 0.5) {
    tips.push({
      emoji: '👟',
      title: '걸음수 부족',
      description: `오늘 ${steps.toLocaleString()}보. 목표의 절반도 안 됐어요!`,
      priority: 4,
    });
  }

  // 고피로 상태 일반 추천
  if (fatiguePercentage >= 75 && tips.length === 0) {
    tips.push({
      emoji: '☕',
      title: '잠깐 쉬어가세요',
      description: '20분 파워낮잠이나 따뜻한 차 한잔 어때요?',
      priority: 5,
    });
  }

  // 물 섭취 추천 (항상)
  const waterCount = activities.filter(a => a.type === ActivityType.WATER).length;
  if (waterCount < 4 && fatiguePercentage >= 40) {
    tips.push({
      emoji: '💧',
      title: '수분 섭취',
      description: '물을 충분히 마셨나요? 탈수도 피로의 원인이에요.',
      priority: 6,
    });
  }

  // 우선순위 정렬 후 최대 3개
  return tips.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
