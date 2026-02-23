import {registerRootComponent} from 'expo';
import notifee, {EventType} from '@notifee/react-native';
import App from './App';

// 백그라운드/종료 상태에서 알림 액션 처리
notifee.onBackgroundEvent(async ({type, detail}) => {
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
  }
});

registerRootComponent(App);
