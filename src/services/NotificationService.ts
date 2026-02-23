/**
 * 로컬 푸시 알림 서비스 (Notifee 기반)
 * 앱이 포그라운드/백그라운드 상태에서 알림 표시
 * 뿜 캐릭터 이미지 + 피로도 수치 포함
 * "했어요!" 버튼으로 피로도 감소 콜백 지원
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
  Event as NotifeeEvent,
} from '@notifee/react-native';
import {PpoomState} from '../types';
import {getPpoomStateFromFatigue} from '../constants/ppoomData';
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

// 뿜 상태 → Android drawable 리소스 매핑
const PPOOM_DRAWABLE: Record<PpoomState, string> = {
  [PpoomState.CHARGED]: 'ppoom_charged',
  [PpoomState.GOOD]: 'ppoom_normal',
  [PpoomState.NORMAL]: 'ppoom_default',
  [PpoomState.TIRED]: 'ppoom_tired',
  [PpoomState.DISCHARGED]: 'ppoom_discharged',
};

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
  private currentFatigue = 50;

  /**
   * 현재 피로도 업데이트 (알림 발송 시 뿜 상태 결정에 사용)
   */
  updateFatiguePercentage(percentage: number): void {
    this.currentFatigue = percentage;
  }

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
   * 포그라운드 이벤트 리스너 등록
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
    return settings.authorizationStatus >= 1;
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
   * 알림 발송 (뿜 캐릭터 + 피로도 수치 포함)
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
    const ppoomState = getPpoomStateFromFatigue(this.currentFatigue);
    const ppoomDrawable = PPOOM_DRAWABLE[ppoomState];
    const pct = Math.round(this.currentFatigue);

    await notifee.displayNotification({
      title,
      subtitle: `피로도 ${pct}%`,
      body,
      data: {type},
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        largeIcon: ppoomDrawable,
        pressAction: {id: 'default'},
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: ppoomDrawable,
        },
        actions: hasReward
          ? [
              {
                title: '했어요! ✓',
                pressAction: {id: 'done'},
              },
            ]
          : undefined,
      },
      ios: hasReward
        ? {categoryId: 'pirodo_action'}
        : {},
    });
  }

  /**
   * 피로도 기반 알림 체크
   */
  checkFatigueAlert(percentage: number): void {
    this.currentFatigue = percentage;
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
