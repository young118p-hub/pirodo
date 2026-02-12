/**
 * 로컬 푸시 알림 서비스
 * 피로도 레벨별 알림 + 앉아있기 + 수면 부족
 * 매번 다른 재미있는 메시지 랜덤 발송
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

type NotificationType =
  | 'fatigue_excellent'
  | 'fatigue_good'
  | 'fatigue_tired'
  | 'fatigue_exhausted'
  | 'sedentary'
  | 'sleep_deficit';

class NotificationServiceImpl {
  private lastNotificationTime: Record<NotificationType, number> = {
    fatigue_excellent: 0,
    fatigue_good: 0,
    fatigue_tired: 0,
    fatigue_exhausted: 0,
    sedentary: 0,
    sleep_deficit: 0,
  };

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
   * 쿨다운 체크 - 같은 타입 알림을 너무 자주 보내지 않도록
   */
  private canSendNotification(type: NotificationType): boolean {
    const now = Date.now();
    const lastTime = this.lastNotificationTime[type];
    return now - lastTime >= NOTIFICATION_COOLDOWN;
  }

  /**
   * 알림 발송 (현재는 Alert, 추후 네이티브 알림으로 교체 가능)
   */
  private sendNotification(
    type: NotificationType,
    title: string,
    body: string,
  ): void {
    if (!this.canSendNotification(type)) return;

    this.lastNotificationTime[type] = Date.now();

    // 앱이 포그라운드에 있을 때는 Alert 사용
    // 백그라운드 알림은 추후 react-native-push-notification 등으로 확장
    Alert.alert(title, body, [{text: '확인', style: 'default'}]);
  }

  /**
   * 피로도 기반 알림 체크 (레벨별 랜덤 메시지)
   * - 0~25%: 칭찬 & 응원
   * - 26~50%: 가볍게 챙기기
   * - 51~75%: 경고 & 유머
   * - 76~100%: 강력 경고 & 블랙유머
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
