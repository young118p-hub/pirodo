/**
 * 미션 할당 알고리즘
 * 피로도 기반 난이도 결정, 중복 제외, 카테고리 분산
 */

import {
  MissionDifficulty,
  MissionCategory,
  MissionTemplate,
  DailyMission,
  MissionHistoryRecord,
} from '../types';
import {MISSION_TEMPLATES} from '../constants/missionTemplates';

/**
 * 피로도 → 난이도 결정
 * 0-30%: CHALLENGE (에너지 많으니 도전적)
 * 30-60%: NORMAL
 * 60%+: EASY (피곤하니 쉬운 것)
 */
function getDifficultyFromFatigue(fatiguePercentage: number): MissionDifficulty {
  if (fatiguePercentage <= 30) return MissionDifficulty.CHALLENGE;
  if (fatiguePercentage <= 60) return MissionDifficulty.NORMAL;
  return MissionDifficulty.EASY;
}

/**
 * 피로도 → 미션 개수
 * 60%+: 2개 (EASY)
 * 나머지: 3개
 */
function getMissionCount(fatiguePercentage: number): number {
  return fatiguePercentage > 60 ? 2 : 3;
}

/**
 * 최근 3일 히스토리에서 사용된 미션 ID 추출
 */
function getRecentMissionIds(history: MissionHistoryRecord[]): Set<string> {
  const ids = new Set<string>();
  const recent = history.slice(-3);
  for (const record of recent) {
    for (const mission of record.missions) {
      ids.add(mission.templateId);
    }
  }
  return ids;
}

/**
 * 최근 2일 히스토리에서 사용된 카테고리 추출
 */
function getRecentCategories(history: MissionHistoryRecord[]): MissionCategory[] {
  const categories: MissionCategory[] = [];
  const recent = history.slice(-2);
  for (const record of recent) {
    for (const mission of record.missions) {
      categories.push(mission.category);
    }
  }
  return categories;
}

/**
 * 배열에서 랜덤 n개 선택 (Fisher-Yates)
 */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/**
 * 일일 미션 할당
 */
export function assignDailyMissions(
  fatiguePercentage: number,
  history: MissionHistoryRecord[],
): DailyMission[] {
  const difficulty = getDifficultyFromFatigue(fatiguePercentage);
  const count = getMissionCount(fatiguePercentage);
  const recentIds = getRecentMissionIds(history);
  const recentCategories = getRecentCategories(history);

  // 1. 난이도에 맞는 템플릿 필터
  let candidates = MISSION_TEMPLATES.filter(t => t.difficulty === difficulty);

  // 2. 최근 3일 동일 미션 제외
  candidates = candidates.filter(t => !recentIds.has(t.id));

  // 후보가 부족하면 다른 난이도도 포함
  if (candidates.length < count) {
    const fallback = MISSION_TEMPLATES.filter(
      t => t.difficulty !== difficulty && !recentIds.has(t.id),
    );
    candidates = [...candidates, ...fallback];
  }

  // 3. 카테고리 분산: 최근 2일 연속 카테고리 제한
  const categoryCount = new Map<MissionCategory, number>();
  for (const cat of recentCategories) {
    categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
  }

  // 연속 2번 이상 나온 카테고리는 우선도 하락 (제외가 아닌 후순위)
  const overusedCategories = new Set<MissionCategory>();
  for (const [cat, cnt] of categoryCount.entries()) {
    if (cnt >= 2) overusedCategories.add(cat);
  }

  const preferred = candidates.filter(t => !overusedCategories.has(t.category));
  const fallbackCandidates = candidates.filter(t => overusedCategories.has(t.category));

  // 4. 카테고리 분산 선택
  const selected: MissionTemplate[] = [];
  const usedCategories = new Set<MissionCategory>();
  const pool = [...preferred];

  // 우선 다른 카테고리에서 하나씩
  for (const template of pickRandom(pool, pool.length)) {
    if (selected.length >= count) break;
    if (!usedCategories.has(template.category)) {
      selected.push(template);
      usedCategories.add(template.category);
    }
  }

  // 부족하면 같은 카테고리도 허용
  if (selected.length < count) {
    const remaining = pool.filter(t => !selected.includes(t));
    for (const template of pickRandom(remaining, remaining.length)) {
      if (selected.length >= count) break;
      selected.push(template);
    }
  }

  // 그래도 부족하면 fallback에서
  if (selected.length < count) {
    for (const template of pickRandom(fallbackCandidates, fallbackCandidates.length)) {
      if (selected.length >= count) break;
      selected.push(template);
    }
  }

  return selected.map(t => ({
    templateId: t.id,
    category: t.category,
    difficulty: t.difficulty,
    title: t.title,
    description: t.description,
    emoji: t.emoji,
    expReward: t.expReward,
    completed: false,
  }));
}
