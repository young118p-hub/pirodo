/**
 * WidgetService - Android 위젯 데이터 브릿지
 *
 * RN에서 AsyncStorage에 위젯용 데이터를 저장하면
 * 네이티브 Android 위젯이 SharedPreferences를 통해 읽어간다.
 *
 * 네이티브 위젯 구현은 android/ 폴더에 별도로 필요:
 * - FatigueWidgetProvider.java (AppWidgetProvider)
 * - fatigue_widget_layout.xml (위젯 레이아웃)
 * - fatigue_widget_info.xml (위젯 메타데이터)
 *
 * 이 서비스는 JS 측에서 위젯에 필요한 데이터를 준비/저장하는 역할
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, Platform} from 'react-native';

const WIDGET_DATA_KEY = '@pirodo_widget_data';

export interface WidgetData {
  fatiguePercentage: number;
  fatigueLevel: string;
  fatigueColor: string;
  fatigueMessage: string;
  lastUpdated: string;
  stepCount: number;
  sleepHours: number;
}

export class WidgetService {
  /**
   * 위젯 데이터 업데이트
   * 피로도가 변경될 때마다 호출
   */
  static async updateWidgetData(data: WidgetData): Promise<void> {
    try {
      // AsyncStorage에 저장 (JS 측 백업)
      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data));

      // Android에서는 SharedPreferences + Widget 업데이트 트리거
      if (Platform.OS === 'android' && NativeModules.WidgetModule) {
        await NativeModules.WidgetModule.updateWidget(JSON.stringify(data));
      }
    } catch (e) {
      if (__DEV__) console.error('[WidgetService] 위젯 데이터 업데이트 실패:', e);
    }
  }

  /**
   * 마지막 위젯 데이터 조회
   */
  static async getLastWidgetData(): Promise<WidgetData | null> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
