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
  '@pirodo_theme',
  '@pirodo_app_state_history',
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
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          // parse 실패 시 raw string으로 저장
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
      // 크기 제한 (10MB)
      if (jsonString.length > 10 * 1024 * 1024) {
        return {success: false, message: '백업 파일이 너무 큽니다. (최대 10MB)'};
      }

      const backup = JSON.parse(jsonString) as BackupData;

      // 스키마 검증
      if (backup.appName !== 'pirodo') {
        return {success: false, message: '유효하지 않은 백업 파일입니다.'};
      }
      if (typeof backup.version !== 'number' || backup.version < 1) {
        return {success: false, message: '지원하지 않는 백업 버전입니다.'};
      }
      if (!backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
        return {success: false, message: '백업 데이터가 비어있거나 형식이 잘못되었습니다.'};
      }
      if (!backup.createdAt || isNaN(Date.parse(backup.createdAt))) {
        return {success: false, message: '백업 생성일이 유효하지 않습니다.'};
      }

      // 허용된 키만 복원
      const allowedKeys = new Set(PIRODO_KEYS);
      let restoredCount = 0;
      for (const [key, value] of Object.entries(backup.data)) {
        if (!key.startsWith('@pirodo_')) continue;
        if (!allowedKeys.has(key)) continue;

        // 값 검증: 직렬화 가능한 타입만 허용
        if (value === null || value === undefined) continue;

        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        // 개별 값 크기 제한 (1MB)
        if (stringValue.length > 1024 * 1024) continue;

        await AsyncStorage.setItem(key, stringValue);
        restoredCount++;
      }

      if (restoredCount === 0) {
        return {success: false, message: '복원할 수 있는 데이터가 없습니다.'};
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
