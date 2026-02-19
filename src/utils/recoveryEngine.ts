/**
 * 회복 추천 엔진
 * 피로도 원인을 분석하고 맞춤 회복 팁 + 액션을 제공
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
      action: {
        label: '20분 낮잠 타이머',
        type: 'timer',
        timerMinutes: 20,
      },
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
      action: {
        label: '10분 산책 타이머',
        type: 'timer',
        timerMinutes: 10,
      },
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
      action: {
        label: '눈 휴식 타이머 (20초)',
        type: 'timer',
        timerMinutes: 0.33,
      },
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
      action: {
        label: '운동 기록',
        type: 'quick_add',
        activityType: ActivityType.EXERCISE,
        activityDuration: 30,
      },
    });
  }

  // 고피로 상태 일반 추천
  if (fatiguePercentage >= 75 && tips.length === 0) {
    tips.push({
      emoji: '☕',
      title: '잠깐 쉬어가세요',
      description: '20분 파워낮잠이나 따뜻한 차 한잔 어때요?',
      priority: 5,
      action: {
        label: '20분 휴식 타이머',
        type: 'timer',
        timerMinutes: 20,
      },
    });
  }

  // 물 섭취 추천
  const waterCount = activities.filter(a => a.type === ActivityType.WATER).length;
  if (waterCount < 4 && fatiguePercentage >= 40) {
    tips.push({
      emoji: '💧',
      title: '수분 섭취',
      description: '물을 충분히 마셨나요? 탈수도 피로의 원인이에요.',
      priority: 6,
      action: {
        label: '물 마심 기록',
        type: 'quick_add',
        activityType: ActivityType.WATER,
        activityDuration: 1,
      },
    });
  }

  // 스트레스 관리
  const stressActivities = activities.filter(a => a.type === ActivityType.STRESS);
  if (stressActivities.length > 0 || (healthData?.stressLevel && healthData.stressLevel > 60)) {
    tips.push({
      emoji: '🧘',
      title: '스트레스 관리',
      description: '5분 호흡 명상으로 마음을 가라앉혀 보세요.',
      priority: 2.5,
      action: {
        label: '5분 명상 타이머',
        type: 'timer',
        timerMinutes: 5,
      },
    });
  }

  // 카페인 과다
  const caffeineCount = activities.filter(a => a.type === ActivityType.CAFFEINE).length;
  if (caffeineCount >= 3) {
    tips.push({
      emoji: '🫖',
      title: '카페인 줄이기',
      description: `오늘 커피 ${caffeineCount}잔. 물이나 허브차로 대체해 보세요.`,
      priority: 4.5,
      action: {
        label: '물 마시기',
        type: 'quick_add',
        activityType: ActivityType.WATER,
        activityDuration: 1,
      },
    });
  }

  // 좋은 상태일 때 유지 팁
  if (fatiguePercentage < 40 && tips.length === 0) {
    tips.push({
      emoji: '💪',
      title: '컨디션 좋아요!',
      description: '지금 상태를 유지하세요. 가벼운 스트레칭도 좋아요.',
      priority: 10,
    });
  }

  // 우선순위 정렬 후 최대 3개
  return tips.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
