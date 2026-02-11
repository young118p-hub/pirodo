/**
 * 로컬 푸시 알림 서비스
 * 피로도 경고, 앉아있기 알림, 수면 부족 알림
 */

import {Platform, PermissionsAndroid, Alert} from 'react-native';

// 알림 쿨다운 (같은 타입 알림 재발송 최소 간격)
const NOTIFICATION_COOLDOWN = 30 * 60 * 1000; // 30분

type NotificationType = 'fatigue_high' | 'sedentary' | 'sleep_deficit';

class NotificationServiceImpl {
  private lastNotificationTime: Record<NotificationType, number> = {
    fatigue_high: 0,
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
   * 피로도 기반 알림 체크
   */
  checkFatigueAlert(percentage: number): void {
    if (percentage >= 80) {
      this.sendNotification(
        'fatigue_high',
        `피로도 ${Math.round(percentage)}%`,
        '좀 쉬세요! 지금 당장 5분만 눈을 감아보세요.',
      );
    }
  }

  /**
   * 앉아있기 알림
   */
  checkSedentaryAlert(sedentaryMinutes: number): void {
    if (sedentaryMinutes >= 60) {
      this.sendNotification(
        'sedentary',
        '오래 앉아있었어요!',
        `${sedentaryMinutes}분째 앉아있어요. 일어나서 스트레칭 해볼까요?`,
      );
    }
  }

  /**
   * 수면 부족 알림
   */
  checkSleepAlert(sleepHours: number): void {
    if (sleepHours > 0 && sleepHours < 6) {
      this.sendNotification(
        'sleep_deficit',
        '수면 부족 주의',
        `어젯밤 ${sleepHours}시간 수면. 오늘은 일찍 쉬세요!`,
      );
    }
  }

  /**
   * 알림 쿨다운 리셋
   */
  resetCooldowns(): void {
    this.lastNotificationTime = {
      fatigue_high: 0,
      sedentary: 0,
      sleep_deficit: 0,
    };
  }
}

export const NotificationService = new NotificationServiceImpl();
