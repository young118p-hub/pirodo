/**
 * 피로도 앱 타입 정의
 */

/**
 * 활동 유형
 */
export enum ActivityType {
  // 피로 증가 요소
  WORK = 'WORK',
  SCREEN_TIME = 'SCREEN_TIME',
  SITTING = 'SITTING',
  STRESS = 'STRESS',
  CAFFEINE = 'CAFFEINE',

  // 회복 요소
  SLEEP = 'SLEEP',
  EXERCISE = 'EXERCISE',
  REST = 'REST',
  OUTDOOR = 'OUTDOOR',
  WATER = 'WATER',
  MEAL = 'MEAL',
}

/**
 * 활동 타입 메타데이터
 */
export interface ActivityTypeInfo {
  type: ActivityType;
  displayName: string;
  emoji: string;
  fatigueWeight: number; // 피로도 가중치 (-는 회복, +는 피로)
  isRecovery: boolean;
}

/**
 * 활동 기록
 */
export interface ActivityRecord {
  id: string;
  type: ActivityType;
  durationMinutes: number;
  timestamp: Date;
  note?: string;
}

/**
 * 피로도 레벨
 */
export enum FatigueLevel {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  TIRED = 'TIRED',
  EXHAUSTED = 'EXHAUSTED',
}

/**
 * 피로도 레벨 정보
 */
export interface FatigueLevelInfo {
  level: FatigueLevel;
  range: [number, number];
  displayName: string;
  emoji: string;
  color: string;
  message: string;
}

/**
 * 일일 피로도 데이터
 */
export interface DailyFatigueData {
  date: string; // ISO date string
  activities: ActivityRecord[];
  currentFatiguePercentage: number; // 0-100
  notes?: string;
}

/**
 * 피로도 통계
 */
export interface FatigueStats {
  totalActivities: number;
  totalFatigueImpact: number;
  activityContributions: Map<ActivityType, number>;
  recommendation: string;
  fatigueMessage: string;
}
