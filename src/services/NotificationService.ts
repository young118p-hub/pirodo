/**
 * 로컬 푸시 알림 서비스 (Notifee 기반)
 * 앱이 포그라운드/백그라운드/종료 상태 모두에서 알림 표시
 * "했어요!" 버튼으로 피로도 감소 콜백 지원
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
  Event as NotifeeEvent,
} from '@notifee/react-native';
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

const CHANNEL_ID = 'pirodo_fatigue';

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
  private channelCreated = false;

  /**
   * Android 알림 채널 생성
   */
  async ensureChannel(): Promise<void> {
    if (this.channelCreated) return;
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: '피로도 알림',
      description: '피로도 상태 변화 및 회복 추천 알림',
      importance: AndroidImportance.HIGH,
    });
    this.channelCreated = true;
  }

  /**
   * 포그라운드 이벤트 리스너 등록 (App 내에서 호출)
   */
  setupForegroundListener(): () => void {
    return notifee.onForegroundEvent(({type, detail}: NotifeeEvent) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'done') {
        const notifType = detail.notification?.data?.type as string | undefined;
        if (notifType) {
          const reward = ACTION_REWARDS[notifType];
          if (reward && this.onActionDone) {
            this.onActionDone(reward);
          }
        }
        // 알림 닫기
        if (detail.notification?.id) {
          notifee.cancelNotification(detail.notification.id);
        }
      }
    });
  }

  /**
   * FatigueContext에서 "했어요!" 콜백 등록
   */
  registerActionCallback(callback: ActionCallback): void {
    this.onActionDone = callback;
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus >= 1 // AUTHORIZED or PROVISIONAL
    );
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
   * 알림 발송
   */
  private async sendNotification(
    type: NotificationType,
    title: string,
    body: string,
  ): Promise<void> {
    if (!this.canSendNotification(type)) return;

    this.lastNotificationTime[type] = Date.now();

    await this.ensureChannel();

    const hasReward = !!ACTION_REWARDS[type];

    await notifee.displayNotification({
      title,
      body,
      data: {type},
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
        style: {type: AndroidStyle.BIGTEXT, text: body},
        actions: hasReward
          ? [
              {
                title: '했어요! ✓',
                pressAction: {id: 'done'},
              },
            ]
          : undefined,
      },
      ios: {
        categoryId: hasReward ? 'pirodo_action' : undefined,
      },
    });
  }

  /**
   * 피로도 기반 알림 체크
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
   * 앉아있기 알림
   */
  checkSedentaryAlert(sedentaryMinutes: number): void {
    if (sedentaryMinutes >= 60) {
      const {title, body} = getSedentaryNotification(sedentaryMinutes);
      this.sendNotification('sedentary', title, body);
    }
  }

  /**
   * 수면 부족 알림
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
