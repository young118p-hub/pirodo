/**
 * 경험치 / 레벨업 계산 엔진
 */

import {PpoomCharacterData} from '../types';
import {getRequiredExp, MAX_LEVEL} from '../constants/ppoomData';

export interface LevelUpResult {
  character: PpoomCharacterData;
  leveledUp: boolean;
  newLevel: number;
  expGained: number;
}

/**
 * 경험치 추가 + 레벨업 처리
 * @param character 현재 캐릭터 데이터
 * @param expAmount 획득 경험치
 * @returns 업데이트된 캐릭터 + 레벨업 여부
 */
export function addExp(
  character: PpoomCharacterData,
  expAmount: number,
): LevelUpResult {
  const updated = {...character};
  const oldLevel = updated.level;
  updated.exp += expAmount;

  // 연속 레벨업 처리
  while (updated.level < MAX_LEVEL) {
    const required = getRequiredExp(updated.level);
    if (updated.exp >= required) {
      updated.exp -= required;
      updated.level += 1;
    } else {
      break;
    }
  }

  // 최대 레벨이면 경험치 캡
  if (updated.level >= MAX_LEVEL) {
    updated.level = MAX_LEVEL;
    updated.exp = Math.min(updated.exp, getRequiredExp(MAX_LEVEL));
  }

  return {
    character: updated,
    leveledUp: updated.level > oldLevel,
    newLevel: updated.level,
    expGained: expAmount,
  };
}

/**
 * 현재 레벨의 경험치 진행률 (0~1)
 */
export function getExpProgress(character: PpoomCharacterData): number {
  if (character.level >= MAX_LEVEL) return 1;
  const required = getRequiredExp(character.level);
  return Math.min(character.exp / required, 1);
}
