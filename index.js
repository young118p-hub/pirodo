/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// 백그라운드/종료 상태에서 알림 이벤트 처리
// Notifee는 모든 백그라운드 이벤트를 핸들링해야 함
notifee.onBackgroundEvent(async ({type, detail}) => {
  // "했어요!" 버튼 클릭
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'done') {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const notifType = detail.notification?.data?.type;
      if (notifType) {
        await AsyncStorage.setItem(
          '@pirodo_pending_reward',
          JSON.stringify({type: notifType, timestamp: Date.now()}),
        );
      }
    } catch (_) {}

    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
    return;
  }

  // 알림 본문 클릭 → 앱 열기만 (별도 처리 없음)
  if (type === EventType.PRESS) {
    return;
  }

  // 기타 이벤트 (DELIVERED, DISMISSED 등) 무시
});

AppRegistry.registerComponent(appName, () => App);
