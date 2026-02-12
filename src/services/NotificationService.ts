/**
 * 로컬 푸시 알림 서비스
 * 피로도 레벨별 알림 + 앉아있기 + 수면 부족
 * "했어요!" 버튼으로 피로도 감소 콜백 지원
 */

import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {
  getFatigueExcellentNotification,
  getFatigueGoodNotification,
  getFatigueTiredNotification,
  getFatigueExhaustedNotification,
  getSedentaryNotification,
  getSleepNotification,
} from '../utils/notificationTemplates';

// 알림 쿨다운 (같은 타입 알림 재발송 최소 간격)
const NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30분

// "했어요!" 시 피로도 감소량 (타입별)
const ACTION_REWARDS: Record<string, number> = {
  fatigue_tired: 3,
  fatigue_exhausted: 5,
  sedentary: 4,
  sleep_deficit: 2,
};

type NotificationType =
  | 'fatigue_excellent'
  | 'fatigue_good'
  | 'fatigue_tired'
  | 'fatigue_exhausted'
  | 'sedentary'
  | 'sleep_deficit';

// 알림 액션 콜백 (FatigueContext에서 등록)
type ActionCallback = (rewardAmount: number) => void;

class NotificationServiceImpl {
  private lastNotificationTime: Record<NotificationType, number> = {
    fatigue_excellent: 0,
    fatigue_good: 0,
    fatigue_tired: 0,
    fatigue_exhausted: 0,
    sedentary: 0,
    sleep_deficit: 0,
  };

  private onActionDone: ActionCallback | null = null;

  /**
   * FatigueContext에서 "했어요!" 콜백 등록
   */
  registerActionCallback(callback: ActionCallback): void {
    this.onActionDone = callback;
  }

  /**
   * Android 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  /**
   * 쿨다운 체크
   */
  private canSendNotification(type: NotificationType): boolean {
    const now = Date.now();
    const lastTime = this.lastNotificationTime[type];
    return now - lastTime >= NOTIFICATION_COOLDOWN;
  }

  /**
   * 알림 발송 ("확인" + "했어요!" 버튼)
   */
  private sendNotification(
    type: NotificationType,
    title: string,
    body: string,
  ): void {
    if (!this.canSendNotification(type)) return;

    this.lastNotificationTime[type] = Date.now();

    const reward = ACTION_REWARDS[type];
    const buttons: any[] = [{text: '확인', style: 'cancel' as const}];

    // 피로도 높음, 앉아있기, 수면 부족일 때만 "했어요!" 버튼 표시
    if (reward) {
      buttons.push({
        text: '했어요! ✓',
        style: 'default' as const,
        onPress: () => {
          if (this.onActionDone) {
            this.onActionDone(reward);
          }
        },
      });
    }

    Alert.alert(title, body, buttons);
  }

  /**
   * 피로도 기반 알림 체크 (레벨별 랜덤 메시지)
   */
  checkFatigueAlert(percentage: number): void {
    const pct = Math.round(percentage);

    if (pct <= 25) {
      const {title, body} = getFatigueExcellentNotification(pct);
      this.sendNotification('fatigue_excellent', title, body);
    } else if (pct <= 50) {
      const {title, body} = getFatigueGoodNotification(pct);
      this.sendNotification('fatigue_good', title, body);
    } else if (pct <= 75) {
      const {title, body} = getFatigueTiredNotification(pct);
      this.sendNotification('fatigue_tired', title, body);
    } else {
      const {title, body} = getFatigueExhaustedNotification(pct);
      this.sendNotification('fatigue_exhausted', title, body);
    }
  }

  /**
   * 앉아있기 알림 (랜덤 메시지)
   */
  checkSedentaryAlert(sedentaryMinutes: number): void {
    if (sedentaryMinutes >= 60) {
      const {title, body} = getSedentaryNotification(sedentaryMinutes);
      this.sendNotification('sedentary', title, body);
    }
  }

  /**
   * 수면 부족 알림 (랜덤 메시지)
   */
  checkSleepAlert(sleepHours: number): void {
    if (sleepHours > 0 && sleepHours < 6) {
      const {title, body} = getSleepNotification(sleepHours);
      this.sendNotification('sleep_deficit', title, body);
    }
  }

  /**
   * 알림 쿨다운 리셋
   */
  resetCooldowns(): void {
    this.lastNotificationTime = {
      fatigue_excellent: 0,
      fatigue_good: 0,
      fatigue_tired: 0,
      fatigue_exhausted: 0,
      sedentary: 0,
      sleep_deficit: 0,
    };
  }
}

export const NotificationService = new NotificationServiceImpl();
