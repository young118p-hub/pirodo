/**
 * 뿜(PPOOM) 캐릭터 정적 데이터
 * 상태별 비주얼, 대사, 코스튬, 레벨 테이블
 */

import {PpoomState, CostumeItem} from '../types';

// ============================================================
// 상태별 정보
// ============================================================

export interface PpoomStateInfo {
  state: PpoomState;
  emoji: string;
  color: string;
  darkColor: string;
  bgColor: string;
  darkBgColor: string;
  label: string;
  dialogues: string[];
}

export const PPOOM_STATE_INFO: Record<PpoomState, PpoomStateInfo> = {
  [PpoomState.CHARGED]: {
    state: PpoomState.CHARGED,
    emoji: '⚡',
    color: '#00C7BE',
    darkColor: '#00C7BE',
    bgColor: '#E8FAF9',
    darkBgColor: '#0D2E2C',
    label: '충전 완료',
    dialogues: [
      '오늘 컨디션 최고야! 뭐든 할 수 있어!',
      '에너지 뿜뿜! 나 지금 빛나고 있지?',
      '이 기세로 오늘 하루도 파이팅!',
      '완전 충전됐어! 세상을 삼킬 기세야!',
      '최고의 하루가 될 거야, 확신해!',
      '이렇게 좋은 날엔 뭘 해도 잘 될 거야~',
    ],
  },
  [PpoomState.GOOD]: {
    state: PpoomState.GOOD,
    emoji: '😉',
    color: '#34C759',
    darkColor: '#30D158',
    bgColor: '#EAFAF0',
    darkBgColor: '#0D2E1A',
    label: '좋음',
    dialogues: [
      '오늘 꽤 괜찮은데? 이 컨디션 유지하자!',
      '기분 좋은 하루~ 미션도 가볍게 클리어!',
      '에너지 넉넉해! 뭐 해볼까?',
      '좋은 컨디션이야! 이대로 가자~',
      '나 지금 기분 좋아! 같이 뭐 하자!',
      '오늘은 뭘 해도 잘 될 것 같아!',
    ],
  },
  [PpoomState.NORMAL]: {
    state: PpoomState.NORMAL,
    emoji: '😊',
    color: '#5856D6',
    darkColor: '#7B7AE0',
    bgColor: '#EEEDFC',
    darkBgColor: '#1E1D3A',
    label: '보통',
    dialogues: [
      '오늘도 무난하게~ 천천히 가자!',
      '나쁘지 않은 컨디션이야!',
      '적당히 쉬면서 적당히 움직이자~',
      '괜찮은 하루야! 미션 해볼까?',
      '보통이면 충분해, 무리하지 말자!',
      '이 정도면 할 만하지? 같이 힘내자!',
    ],
  },
  [PpoomState.TIRED]: {
    state: PpoomState.TIRED,
    emoji: '😮‍💨',
    color: '#FF9F0A',
    darkColor: '#FFB340',
    bgColor: '#FFF5EB',
    darkBgColor: '#2E2418',
    label: '피곤',
    dialogues: [
      '조금 피곤한 것 같아... 쉬엄쉬엄 하자',
      '에너지가 좀 떨어졌어... 물이라도 마셔볼까?',
      '무리하지 마! 나도 같이 쉴게~',
      '피곤할 때는 간단한 것부터 하자!',
      '오늘은 좀 힘든 날이구나... 괜찮아',
      '잠깐 쉬어가도 돼! 급한 건 없잖아~',
    ],
  },
  [PpoomState.DISCHARGED]: {
    state: PpoomState.DISCHARGED,
    emoji: '😴',
    color: '#FF453A',
    darkColor: '#FF6961',
    bgColor: '#FFF0F0',
    darkBgColor: '#2E1A1A',
    label: '방전',
    dialogues: [
      '완전 방전이야... 제발 좀 쉬자...',
      '지금은 아무것도 하지 말고 쉬어!',
      '몸이 보내는 신호야... 오늘은 일찍 자자',
      '더 이상은 무리야... 내일을 위해 충전하자',
      '쉬는 것도 용기야! 지금 쉬어야 해!',
      '방전됐어... 가벼운 스트레칭이라도 해볼까?',
    ],
  },
};

// ============================================================
// 시간대별 대사 (상태와 무관하게 시간대에 맞는 대사)
// ============================================================

export type TimeSlot = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export const TIME_DIALOGUES: Record<TimeSlot, string[]> = {
  morning: [
    '좋은 아침! 오늘 하루도 파이팅!',
    '잘 잤어? 오늘은 어떤 하루가 될까~',
    '아침이야! 물 한 잔 마시고 시작하자!',
    '일어났구나! 기지개 한번 쭉~',
    '좋은 아침이야! 오늘 뿜이랑 같이 힘내자!',
  ],
  lunch: [
    '밥 먹었어? 잘 챙겨 먹어야 해!',
    '점심시간이다! 뭐 먹을 거야?',
    '식사하고 잠깐 산책 어때?',
    '에너지 충전 타임! 맛있는 거 먹자~',
    '오전 수고했어! 밥 먹고 힘내자!',
  ],
  afternoon: [
    '오후인데 졸리지 않아? 스트레칭 해볼까!',
    '오후도 힘내자! 거의 다 왔어~',
    '물 마셨어? 수분 보충 중요해!',
    '오후 슬럼프 타임... 잠깐 쉬어가도 돼!',
    '조금만 더 힘내면 저녁이야!',
  ],
  evening: [
    '오늘 하루 수고했어! 푹 쉬어~',
    '저녁이야! 오늘 미션 다 했어?',
    '하루 마무리 시간이야~ 편안한 저녁 보내!',
    '오늘도 고생했어! 맛있는 저녁 먹자~',
    '하루를 잘 보냈네! 뿜이가 뿌듯해~',
  ],
  night: [
    '늦었다! 얼른 자야 해~',
    '잘 자! 내일도 같이 힘내자!',
    '오늘 수고 많았어... 푹 쉬어!',
    '꿈에서 만나자~ 좋은 꿈 꿔!',
    '밤이 깊었어... 핸드폰 내려놓고 자자!',
  ],
};

// ============================================================
// 피로도 → 뿜 상태 변환
// ============================================================

export function getPpoomStateFromFatigue(fatiguePercentage: number): PpoomState {
  if (fatiguePercentage <= 20) return PpoomState.CHARGED;
  if (fatiguePercentage <= 40) return PpoomState.GOOD;
  if (fatiguePercentage <= 60) return PpoomState.NORMAL;
  if (fatiguePercentage <= 80) return PpoomState.TIRED;
  return PpoomState.DISCHARGED;
}

// ============================================================
// 레벨 경험치 테이블
// ============================================================

/**
 * 레벨 N → N+1에 필요한 경험치
 * 초반 빠르게, 후반 완만하게
 * Lv1→2: 30, Lv5→6: 50, Lv10→11: 75, Lv20→21: 125, Lv30→31: 175
 */
export function getRequiredExp(level: number): number {
  return 30 + 5 * (level - 1);
}

/** 최대 레벨 */
export const MAX_LEVEL = 30;

// ============================================================
// 코스튬 목록
// ============================================================

export const ALL_COSTUMES: CostumeItem[] = [
  // 기본
  {id: 'default', name: '기본', emoji: '🫧', description: '뿜의 기본 모습', rarity: 'common', unlockCondition: {type: 'default'}},

  // Common (레벨 해금)
  {id: 'sunglasses', name: '선글라스', emoji: '🕶️', description: '멋쟁이 뿜', rarity: 'common', unlockCondition: {type: 'level', level: 3}},
  {id: 'cap', name: '모자', emoji: '🧢', description: '캡 쓴 뿜', rarity: 'common', unlockCondition: {type: 'level', level: 5}},
  {id: 'scarf', name: '목도리', emoji: '🧣', description: '따뜻한 뿜', rarity: 'common', unlockCondition: {type: 'level', level: 7}},
  {id: 'flower', name: '꽃', emoji: '🌸', description: '봄날의 뿜', rarity: 'common', unlockCondition: {type: 'level', level: 10}},

  // Common (미션 해금)
  {id: 'headphones', name: '헤드폰', emoji: '🎧', description: '음악 듣는 뿜', rarity: 'common', unlockCondition: {type: 'missions', count: 10}},
  {id: 'book', name: '책', emoji: '📖', description: '독서하는 뿜', rarity: 'common', unlockCondition: {type: 'missions', count: 20}},
  {id: 'balloon', name: '풍선', emoji: '🎈', description: '파티 뿜', rarity: 'common', unlockCondition: {type: 'missions', count: 30}},

  // Rare (스트릭 해금)
  {id: 'star', name: '별', emoji: '⭐', description: '반짝이는 뿜', rarity: 'rare', unlockCondition: {type: 'streak', days: 3}},
  {id: 'rainbow', name: '무지개', emoji: '🌈', description: '무지개 뿜', rarity: 'rare', unlockCondition: {type: 'streak', days: 7}},
  {id: 'sparkle', name: '반짝반짝', emoji: '✨', description: '빛나는 뿜', rarity: 'rare', unlockCondition: {type: 'level', level: 12}},
  {id: 'ribbon', name: '리본', emoji: '🎀', description: '귀여운 뿜', rarity: 'rare', unlockCondition: {type: 'missions', count: 50}},

  // Epic (높은 스트릭/레벨)
  {id: 'crown', name: '왕관', emoji: '👑', description: '왕 뿜', rarity: 'epic', unlockCondition: {type: 'streak', days: 14}},
  {id: 'fire', name: '불꽃', emoji: '🔥', description: '열정 뿜', rarity: 'epic', unlockCondition: {type: 'streak', days: 21}},
  {id: 'crystal', name: '크리스탈', emoji: '💎', description: '다이아 뿜', rarity: 'epic', unlockCondition: {type: 'level', level: 18}},
  {id: 'rocket', name: '로켓', emoji: '🚀', description: '우주 뿜', rarity: 'epic', unlockCondition: {type: 'missions', count: 100}},

  // Legendary
  {id: 'aurora', name: '오로라', emoji: '🌌', description: '오로라를 두른 뿜', rarity: 'legendary', unlockCondition: {type: 'streak', days: 30}},
  {id: 'phoenix', name: '불사조', emoji: '🦅', description: '불사조 뿜', rarity: 'legendary', unlockCondition: {type: 'level', level: 25}},
  {id: 'galaxy', name: '은하수', emoji: '🌠', description: '은하 뿜', rarity: 'legendary', unlockCondition: {type: 'missions', count: 200}},
  {id: 'thunder', name: '번개', emoji: '⚡', description: '번개 뿜', rarity: 'legendary', unlockCondition: {type: 'level', level: 30}},
];
