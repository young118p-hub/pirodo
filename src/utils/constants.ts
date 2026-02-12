/**
 * 앱 상수 정의
 */

import {ActivityType, ActivityTypeInfo, FatigueLevel, FatigueLevelInfo, InputMode} from '../types';

/**
 * 활동 타입별 정보
 */
export const ACTIVITY_TYPE_INFO: Record<ActivityType, ActivityTypeInfo> = {
  [ActivityType.WORK]: {
    type: ActivityType.WORK,
    displayName: '업무',
    emoji: '💼',
    fatigueWeight: 0.20,
    isRecovery: false,
  },
  [ActivityType.SCREEN_TIME]: {
    type: ActivityType.SCREEN_TIME,
    displayName: '스크린 타임',
    emoji: '📱',
    fatigueWeight: 0.15,
    isRecovery: false,
  },
  [ActivityType.SITTING]: {
    type: ActivityType.SITTING,
    displayName: '앉아있기',
    emoji: '🪑',
    fatigueWeight: 0.10,
    isRecovery: false,
  },
  [ActivityType.STRESS]: {
    type: ActivityType.STRESS,
    displayName: '스트레스',
    emoji: '😰',
    fatigueWeight: 0.25,
    isRecovery: false,
  },
  [ActivityType.CAFFEINE]: {
    type: ActivityType.CAFFEINE,
    displayName: '카페인',
    emoji: '☕',
    fatigueWeight: 0.05,
    isRecovery: false,
  },
  [ActivityType.SLEEP]: {
    type: ActivityType.SLEEP,
    displayName: '수면',
    emoji: '😴',
    fatigueWeight: -0.35,
    isRecovery: true,
  },
  [ActivityType.EXERCISE]: {
    type: ActivityType.EXERCISE,
    displayName: '운동',
    emoji: '🏃',
    fatigueWeight: -0.15,
    isRecovery: true,
  },
  [ActivityType.REST]: {
    type: ActivityType.REST,
    displayName: '휴식',
    emoji: '🛋️',
    fatigueWeight: -0.20,
    isRecovery: true,
  },
  [ActivityType.OUTDOOR]: {
    type: ActivityType.OUTDOOR,
    displayName: '실외 활동',
    emoji: '🌳',
    fatigueWeight: -0.10,
    isRecovery: true,
  },
  [ActivityType.WATER]: {
    type: ActivityType.WATER,
    displayName: '물 섭취',
    emoji: '💧',
    fatigueWeight: -0.05,
    isRecovery: true,
  },
  [ActivityType.MEAL]: {
    type: ActivityType.MEAL,
    displayName: '식사',
    emoji: '🍽️',
    fatigueWeight: -0.08,
    isRecovery: true,
  },
};

/**
 * 피로도 레벨별 정보
 */
export const FATIGUE_LEVEL_INFO: Record<FatigueLevel, FatigueLevelInfo> = {
  [FatigueLevel.EXCELLENT]: {
    level: FatigueLevel.EXCELLENT,
    range: [0, 25],
    displayName: '완전 충전',
    emoji: '🔋',
    color: '#00C7BE',
    message: '최상의 컨디션입니다!',
  },
  [FatigueLevel.GOOD]: {
    level: FatigueLevel.GOOD,
    range: [26, 50],
    displayName: '양호',
    emoji: '😊',
    color: '#5856D6',
    message: '좋은 상태입니다. 이대로 유지하세요!',
  },
  [FatigueLevel.TIRED]: {
    level: FatigueLevel.TIRED,
    range: [51, 75],
    displayName: '피곤함',
    emoji: '😓',
    color: '#FF9F0A',
    message: '휴식이 필요합니다. 잠시 쉬어가세요.',
  },
  [FatigueLevel.EXHAUSTED]: {
    level: FatigueLevel.EXHAUSTED,
    range: [76, 100],
    displayName: '탈진',
    emoji: '🚨',
    color: '#FF453A',
    message: '위험 수준! 즉시 휴식하세요!',
  },
};

/**
 * 피로도 레벨 가져오기
 */
export const getFatigueLevelFromPercentage = (percentage: number): FatigueLevel => {
  if (percentage <= 25) return FatigueLevel.EXCELLENT;
  if (percentage <= 50) return FatigueLevel.GOOD;
  if (percentage <= 75) return FatigueLevel.TIRED;
  return FatigueLevel.EXHAUSTED;
};

/**
 * 권장 수치
 */
export const RECOMMENDED = {
  SLEEP_HOURS: 7,
  WORK_HOURS: 8,
  SCREEN_HOURS: 4,
  EXERCISE_MINUTES: 30,
  WATER_GLASSES: 8,
};

/**
 * 건강 데이터 기반 피로도 가중치
 */
export const HEALTH_WEIGHTS = {
  SEDENTARY_PER_HOUR: 10,
  SCREEN_TIME_PER_HOUR: 5,
  STEP_GOAL: 8000,
  SLEEP_OPTIMAL_MIN: 7,
  SLEEP_OPTIMAL_MAX: 9,
  HR_RESTING_HIGH: 80,
  HR_RESTING_LOW: 60,
  HRV_GOOD: 50,
  HRV_POOR: 30,
};

/**
 * 입력 모드별 정보
 */
export const INPUT_MODE_INFO: Record<InputMode, {
  displayName: string;
  emoji: string;
  description: string;
  dataSources: string[];
}> = {
  [InputMode.WATCH]: {
    displayName: '스마트워치',
    emoji: '⌚',
    description: 'Apple Watch / Galaxy Watch 데이터로 자동 측정',
    dataSources: ['심박수', 'HRV', '수면 단계', '걸음수', '스트레스'],
  },
  [InputMode.PHONE]: {
    displayName: '폰 센서',
    emoji: '📱',
    description: '폰 내장 센서와 건강 앱으로 자동 측정',
    dataSources: ['걸음수', '수면 추정', '스크린타임', '앉아있기 감지'],
  },
  [InputMode.MANUAL]: {
    displayName: '간편 입력',
    emoji: '🎚️',
    description: '슬라이더로 현재 컨디션을 직접 입력',
    dataSources: ['컨디션 슬라이더'],
  },
};

/**
 * 기본 설정값
 */
export const DEFAULT_SETTINGS = {
  inputMode: InputMode.MANUAL as InputMode,
  enableSedentaryDetection: true,
  sedentaryThresholdMinutes: 30,
  enableNotifications: true,
  daytimeStartHour: 8,
  daytimeEndHour: 22,
};
