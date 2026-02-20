/**
 * 미션 템플릿 풀
 * 6카테고리 x 3난이도 x 3~4개씩 ≈ 60개
 */

import {MissionTemplate, MissionCategory, MissionDifficulty} from '../types';

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // ============================================================
  // WATER (수분)
  // ============================================================
  // EASY
  {id: 'water_e1', category: MissionCategory.WATER, difficulty: MissionDifficulty.EASY, title: '물 한 잔 마시기', description: '지금 바로 물 한 잔!', emoji: '💧', expReward: 10},
  {id: 'water_e2', category: MissionCategory.WATER, difficulty: MissionDifficulty.EASY, title: '따뜻한 차 마시기', description: '허브차나 녹차 한 잔 어때?', emoji: '🍵', expReward: 10},
  {id: 'water_e3', category: MissionCategory.WATER, difficulty: MissionDifficulty.EASY, title: '카페인 대신 물 선택', description: '커피 대신 물을 골라봐!', emoji: '🚰', expReward: 10},

  // NORMAL
  {id: 'water_n1', category: MissionCategory.WATER, difficulty: MissionDifficulty.NORMAL, title: '물 3잔 이상 마시기', description: '오늘 중 3잔은 꼭!', emoji: '💧', expReward: 20},
  {id: 'water_n2', category: MissionCategory.WATER, difficulty: MissionDifficulty.NORMAL, title: '식사 전 물 한 잔', description: '밥 먹기 전에 물부터!', emoji: '🥤', expReward: 20},
  {id: 'water_n3', category: MissionCategory.WATER, difficulty: MissionDifficulty.NORMAL, title: '레몬수 만들어 마시기', description: '레몬이나 과일 넣은 물!', emoji: '🍋', expReward: 20},

  // CHALLENGE
  {id: 'water_c1', category: MissionCategory.WATER, difficulty: MissionDifficulty.CHALLENGE, title: '물 2리터 마시기', description: '하루 2리터 도전!', emoji: '🏆', expReward: 30},
  {id: 'water_c2', category: MissionCategory.WATER, difficulty: MissionDifficulty.CHALLENGE, title: '카페인 없는 하루', description: '오늘 하루 카페인 프리!', emoji: '☕', expReward: 30},
  {id: 'water_c3', category: MissionCategory.WATER, difficulty: MissionDifficulty.CHALLENGE, title: '매 시간 물 마시기', description: '1시간마다 물 한 잔씩!', emoji: '⏰', expReward: 30},

  // ============================================================
  // ACTIVITY (활동/운동)
  // ============================================================
  // EASY
  {id: 'act_e1', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.EASY, title: '5분 스트레칭', description: '목, 어깨, 허리 늘려보자!', emoji: '🙆', expReward: 10},
  {id: 'act_e2', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.EASY, title: '자리에서 일어나기', description: '잠깐이라도 일어나서 움직여!', emoji: '🧍', expReward: 10},
  {id: 'act_e3', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.EASY, title: '심호흡 10번', description: '깊~게 들이쉬고 내쉬기', emoji: '🌬️', expReward: 10},
  {id: 'act_e4', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.EASY, title: '눈 운동하기', description: '20-20-20 규칙! 20초간 먼 곳 보기', emoji: '👀', expReward: 10},

  // NORMAL
  {id: 'act_n1', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.NORMAL, title: '15분 산책하기', description: '가볍게 동네 한 바퀴!', emoji: '🚶', expReward: 20},
  {id: 'act_n2', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.NORMAL, title: '계단으로 이동하기', description: '엘리베이터 대신 계단!', emoji: '🪜', expReward: 20},
  {id: 'act_n3', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.NORMAL, title: '3000보 걷기', description: '3000보 이상 걸어보자!', emoji: '👟', expReward: 20},
  {id: 'act_n4', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.NORMAL, title: '플랭크 1분', description: '코어 단련! 1분만 버텨보자', emoji: '💪', expReward: 20},

  // CHALLENGE
  {id: 'act_c1', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.CHALLENGE, title: '30분 운동하기', description: '유산소든 근력이든 30분!', emoji: '🏋️', expReward: 30},
  {id: 'act_c2', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.CHALLENGE, title: '7000보 걷기', description: '7000보 이상 도전!', emoji: '🏃', expReward: 30},
  {id: 'act_c3', category: MissionCategory.ACTIVITY, difficulty: MissionDifficulty.CHALLENGE, title: '야외 활동 1시간', description: '밖에서 1시간 보내기!', emoji: '🌳', expReward: 30},

  // ============================================================
  // SLEEP (수면)
  // ============================================================
  // EASY
  {id: 'sleep_e1', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.EASY, title: '잠자리에 일찍 눕기', description: '평소보다 30분 일찍!', emoji: '🛏️', expReward: 10},
  {id: 'sleep_e2', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.EASY, title: '취침 전 핸드폰 내려놓기', description: '자기 전 10분 노폰!', emoji: '📵', expReward: 10},
  {id: 'sleep_e3', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.EASY, title: '잠깐 눈 감고 쉬기', description: '5분만 눈을 감아보자', emoji: '😌', expReward: 10},

  // NORMAL
  {id: 'sleep_n1', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.NORMAL, title: '7시간 이상 자기', description: '오늘 밤은 꼭 7시간!', emoji: '😴', expReward: 20},
  {id: 'sleep_n2', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.NORMAL, title: '낮잠 20분 자기', description: '파워냅으로 충전!', emoji: '💤', expReward: 20},
  {id: 'sleep_n3', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.NORMAL, title: '취침 루틴 만들기', description: '잠자리 준비 루틴 실천!', emoji: '🌙', expReward: 20},

  // CHALLENGE
  {id: 'sleep_c1', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.CHALLENGE, title: '12시 전에 취침', description: '오늘은 자정 전에 잠들기!', emoji: '🕛', expReward: 30},
  {id: 'sleep_c2', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.CHALLENGE, title: '8시간 숙면', description: '8시간 꿀잠 도전!', emoji: '🌟', expReward: 30},
  {id: 'sleep_c3', category: MissionCategory.SLEEP, difficulty: MissionDifficulty.CHALLENGE, title: '취침 1시간 전 블루라이트 차단', description: '스크린 끄고 아날로그 시간!', emoji: '📴', expReward: 30},

  // ============================================================
  // FOOD (식사/영양)
  // ============================================================
  // EASY
  {id: 'food_e1', category: MissionCategory.FOOD, difficulty: MissionDifficulty.EASY, title: '과일 하나 먹기', description: '비타민 충전! 과일 하나!', emoji: '🍎', expReward: 10},
  {id: 'food_e2', category: MissionCategory.FOOD, difficulty: MissionDifficulty.EASY, title: '천천히 식사하기', description: '급하게 먹지 말고 천천히!', emoji: '🍽️', expReward: 10},
  {id: 'food_e3', category: MissionCategory.FOOD, difficulty: MissionDifficulty.EASY, title: '간식 대신 견과류', description: '과자 대신 견과류 한 줌!', emoji: '🥜', expReward: 10},

  // NORMAL
  {id: 'food_n1', category: MissionCategory.FOOD, difficulty: MissionDifficulty.NORMAL, title: '채소 포함 식사', description: '한 끼에 채소 꼭 포함!', emoji: '🥗', expReward: 20},
  {id: 'food_n2', category: MissionCategory.FOOD, difficulty: MissionDifficulty.NORMAL, title: '세끼 규칙적으로', description: '아침-점심-저녁 다 챙기기!', emoji: '🍱', expReward: 20},
  {id: 'food_n3', category: MissionCategory.FOOD, difficulty: MissionDifficulty.NORMAL, title: '단백질 챙기기', description: '한 끼에 단백질 포함!', emoji: '🥚', expReward: 20},

  // CHALLENGE
  {id: 'food_c1', category: MissionCategory.FOOD, difficulty: MissionDifficulty.CHALLENGE, title: '직접 요리해서 먹기', description: '오늘 한 끼는 직접!', emoji: '👨‍🍳', expReward: 30},
  {id: 'food_c2', category: MissionCategory.FOOD, difficulty: MissionDifficulty.CHALLENGE, title: '배달음식 없는 하루', description: '오늘은 배달 대신 직접!', emoji: '🏠', expReward: 30},
  {id: 'food_c3', category: MissionCategory.FOOD, difficulty: MissionDifficulty.CHALLENGE, title: '설탕/탄산 없는 하루', description: '달콤한 유혹을 이겨내!', emoji: '🚫', expReward: 30},

  // ============================================================
  // MIND (마음/멘탈)
  // ============================================================
  // EASY
  {id: 'mind_e1', category: MissionCategory.MIND, difficulty: MissionDifficulty.EASY, title: '좋아하는 음악 듣기', description: '기분 좋은 노래 한 곡!', emoji: '🎵', expReward: 10},
  {id: 'mind_e2', category: MissionCategory.MIND, difficulty: MissionDifficulty.EASY, title: '하늘 한번 올려다보기', description: '잠깐 밖을 보며 여유를', emoji: '☁️', expReward: 10},
  {id: 'mind_e3', category: MissionCategory.MIND, difficulty: MissionDifficulty.EASY, title: '누군가에게 안부 보내기', description: '카톡이든 전화든 안부 한마디!', emoji: '💌', expReward: 10},
  {id: 'mind_e4', category: MissionCategory.MIND, difficulty: MissionDifficulty.EASY, title: '오늘 감사한 것 1개', description: '아무리 작아도 괜찮아!', emoji: '🙏', expReward: 10},

  // NORMAL
  {id: 'mind_n1', category: MissionCategory.MIND, difficulty: MissionDifficulty.NORMAL, title: '5분 명상하기', description: '눈 감고 호흡에 집중!', emoji: '🧘', expReward: 20},
  {id: 'mind_n2', category: MissionCategory.MIND, difficulty: MissionDifficulty.NORMAL, title: '일기 한 줄 쓰기', description: '오늘 하루를 한 줄로!', emoji: '📝', expReward: 20},
  {id: 'mind_n3', category: MissionCategory.MIND, difficulty: MissionDifficulty.NORMAL, title: 'SNS 1시간 줄이기', description: '평소보다 1시간 덜 보기!', emoji: '📱', expReward: 20},

  // CHALLENGE
  {id: 'mind_c1', category: MissionCategory.MIND, difficulty: MissionDifficulty.CHALLENGE, title: '15분 명상', description: '15분 깊은 명상 시간!', emoji: '🕯️', expReward: 30},
  {id: 'mind_c2', category: MissionCategory.MIND, difficulty: MissionDifficulty.CHALLENGE, title: '감사 일기 3가지', description: '오늘 감사한 것 3개 적기!', emoji: '📓', expReward: 30},
  {id: 'mind_c3', category: MissionCategory.MIND, difficulty: MissionDifficulty.CHALLENGE, title: '디지털 디톡스 2시간', description: '2시간 동안 스크린 끄기!', emoji: '🔇', expReward: 30},

  // ============================================================
  // HABIT (생활습관)
  // ============================================================
  // EASY
  {id: 'habit_e1', category: MissionCategory.HABIT, difficulty: MissionDifficulty.EASY, title: '자세 바로하기', description: '지금 자세 확인! 허리 펴!', emoji: '🧎', expReward: 10},
  {id: 'habit_e2', category: MissionCategory.HABIT, difficulty: MissionDifficulty.EASY, title: '환기하기', description: '창문 열고 신선한 공기!', emoji: '🪟', expReward: 10},
  {id: 'habit_e3', category: MissionCategory.HABIT, difficulty: MissionDifficulty.EASY, title: '손 씻기', description: '깨끗이 손 씻기!', emoji: '🧼', expReward: 10},

  // NORMAL
  {id: 'habit_n1', category: MissionCategory.HABIT, difficulty: MissionDifficulty.NORMAL, title: '책상 정리하기', description: '주변 정리하면 머리도 맑아져!', emoji: '🗂️', expReward: 20},
  {id: 'habit_n2', category: MissionCategory.HABIT, difficulty: MissionDifficulty.NORMAL, title: '10분 독서', description: '짧게라도 책 읽기!', emoji: '📚', expReward: 20},
  {id: 'habit_n3', category: MissionCategory.HABIT, difficulty: MissionDifficulty.NORMAL, title: '비타민 챙겨먹기', description: '영양제 잊지 말자!', emoji: '💊', expReward: 20},

  // CHALLENGE
  {id: 'habit_c1', category: MissionCategory.HABIT, difficulty: MissionDifficulty.CHALLENGE, title: '방 청소하기', description: '깔끔한 방에서 새 시작!', emoji: '🧹', expReward: 30},
  {id: 'habit_c2', category: MissionCategory.HABIT, difficulty: MissionDifficulty.CHALLENGE, title: '30분 독서', description: '30분 동안 책에 집중!', emoji: '📖', expReward: 30},
  {id: 'habit_c3', category: MissionCategory.HABIT, difficulty: MissionDifficulty.CHALLENGE, title: '하루 계획 세우기', description: '오늘의 할 일 정리하고 실천!', emoji: '📋', expReward: 30},
];
