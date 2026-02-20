/**
 * 뿜 데이터 저장/로드 서비스
 * AsyncStorage 기반
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {PpoomSaveData} from '../types';

const STORAGE_KEY = '@pirodo_ppoom_data';

const DEFAULT_DATA: PpoomSaveData = {
  character: {
    level: 1,
    exp: 0,
    equippedCostumeId: null,
    unlockedCostumeIds: ['default'],
  },
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
  },
  missionHistory: [],
  currentMissions: null,
};

export class PpoomStorageService {
  static async load(): Promise<PpoomSaveData> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return PpoomStorageService.getDefault();
      const parsed = JSON.parse(raw) as PpoomSaveData;
      // 필드 누락 방지 (마이그레이션)
      return {
        character: {...DEFAULT_DATA.character, ...parsed.character},
        streak: {...DEFAULT_DATA.streak, ...parsed.streak},
        missionHistory: parsed.missionHistory || [],
        currentMissions: parsed.currentMissions || null,
      };
    } catch {
      return PpoomStorageService.getDefault();
    }
  }

  static async save(data: PpoomSaveData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 저장 실패 무시 (다음 저장에서 재시도)
    }
  }

  static getDefault(): PpoomSaveData {
    return {
      character: {...DEFAULT_DATA.character, unlockedCostumeIds: [...DEFAULT_DATA.character.unlockedCostumeIds]},
      streak: {...DEFAULT_DATA.streak},
      missionHistory: [],
      currentMissions: null,
    };
  }
}
