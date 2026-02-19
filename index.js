/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// 백그라운드/종료 상태에서 알림 액션 처리
notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'done') {
    // 백그라운드에서 "했어요!" 누르면 앱 열릴 때 처리됨
    // AsyncStorage에 pending reward를 저장하여 앱 재개 시 반영
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

    // 알림 닫기
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
