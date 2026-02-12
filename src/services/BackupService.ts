/**
 * 데이터 백업/복원 서비스
 * AsyncStorage 전체 데이터를 JSON으로 내보내기/가져오기
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Share, Platform} from 'react-native';

const PIRODO_KEYS = [
  '@pirodo_settings',
  '@pirodo_history',
  '@pirodo_daily_data',
  '@pirodo_fatigue_context',
];

export interface BackupData {
  version: number;
  createdAt: string;
  appName: 'pirodo';
  data: Record<string, unknown>;
}

export class BackupService {
  /**
   * 전체 데이터를 JSON 문자열로 내보내기
   */
  static async exportData(): Promise<string> {
    const data: Record<string, unknown> = {};

    // 모든 pirodo 관련 키의 데이터 수집
    const allKeys = await AsyncStorage.getAllKeys();
    const pirodoKeys = allKeys.filter(key => key.startsWith('@pirodo_'));

    for (const key of pirodoKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      } catch {
        // parse 실패 시 raw string으로 저장
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
    }

    const backup: BackupData = {
      version: 1,
      createdAt: new Date().toISOString(),
      appName: 'pirodo',
      data,
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Share API를 통해 JSON 파일 공유
   */
  static async shareBackup(): Promise<boolean> {
    try {
      const json = await this.exportData();
      const date = new Date().toISOString().split('T')[0];
      const filename = `pirodo-backup-${date}.json`;

      await Share.share({
        message: json,
        title: filename,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * JSON 문자열에서 데이터 복원
   */
  static async importData(jsonString: string): Promise<{success: boolean; message: string}> {
    try {
      const backup = JSON.parse(jsonString) as BackupData;

      // 유효성 검증
      if (backup.appName !== 'pirodo') {
        return {success: false, message: '유효하지 않은 백업 파일입니다.'};
      }
      if (!backup.data || typeof backup.data !== 'object') {
        return {success: false, message: '백업 데이터가 비어있습니다.'};
      }

      // 데이터 복원
      let restoredCount = 0;
      for (const [key, value] of Object.entries(backup.data)) {
        if (key.startsWith('@pirodo_')) {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          await AsyncStorage.setItem(key, stringValue);
          restoredCount++;
        }
      }

      return {
        success: true,
        message: `${restoredCount}개 항목 복원 완료 (백업일: ${backup.createdAt.split('T')[0]})`,
      };
    } catch {
      return {success: false, message: 'JSON 파싱 실패. 유효한 백업 파일인지 확인하세요.'};
    }
  }

  /**
   * 모든 pirodo 데이터 삭제 (초기화)
   */
  static async clearAllData(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const pirodoKeys = allKeys.filter(key => key.startsWith('@pirodo_'));
    await AsyncStorage.multiRemove(pirodoKeys);
  }

  /**
   * 백업 데이터 요약 정보 조회
   */
  static async getDataSummary(): Promise<{
    totalKeys: number;
    historyDays: number;
    settingsExist: boolean;
  }> {
    const allKeys = await AsyncStorage.getAllKeys();
    const pirodoKeys = allKeys.filter(key => key.startsWith('@pirodo_'));

    let historyDays = 0;
    try {
      const historyRaw = await AsyncStorage.getItem('@pirodo_history');
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        historyDays = Array.isArray(history) ? history.length : 0;
      }
    } catch {}

    const settingsExist = pirodoKeys.includes('@pirodo_settings');

    return {
      totalKeys: pirodoKeys.length,
      historyDays,
      settingsExist,
    };
  }
}
