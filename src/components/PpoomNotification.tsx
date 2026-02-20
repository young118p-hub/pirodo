/**
 * 뿜 알림 오버레이
 * Alert.alert 대신 뿜 이미지 + 피로도 수치가 함께 뜨는 커스텀 알림
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import {PpoomState} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS} from '../utils/theme';

// 이미지 매핑
const PPOOM_IMAGES: Record<PpoomState, ImageSourcePropType> = {
  [PpoomState.CHARGED]: require('../../assets/ppoom/charged.png'),
  [PpoomState.GOOD]: require('../../assets/ppoom/normal.png'),
  [PpoomState.NORMAL]: require('../../assets/ppoom/default.png'),
  [PpoomState.TIRED]: require('../../assets/ppoom/tired.png'),
  [PpoomState.DISCHARGED]: require('../../assets/ppoom/discharged.png'),
};

// 피로도 → 뿜 상태
function getStateFromFatigue(pct: number): PpoomState {
  if (pct <= 20) return PpoomState.CHARGED;
  if (pct <= 40) return PpoomState.GOOD;
  if (pct <= 60) return PpoomState.NORMAL;
  if (pct <= 80) return PpoomState.TIRED;
  return PpoomState.DISCHARGED;
}

// 글로벌 알림 핸들러 (NotificationService에서 호출)
type NotificationData = {
  title: string;
  body: string;
  fatiguePercentage: number;
  actionLabel?: string;
  onAction?: () => void;
};

type NotificationHandler = (data: NotificationData) => void;
let _handler: NotificationHandler | null = null;

export function registerNotificationHandler(handler: NotificationHandler) {
  _handler = handler;
}

export function showPpoomNotification(data: NotificationData) {
  if (_handler) {
    _handler(data);
  }
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const PpoomNotification: React.FC = () => {
  const {colors, isDark} = useTheme();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((notifData: NotificationData) => {
    // 이전 타이머 클리어
    if (timerRef.current) clearTimeout(timerRef.current);

    setData(notifData);
    setVisible(true);
    slideAnim.setValue(-200);

    Animated.spring(slideAnim, {
      toValue: 50,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // 6초 후 자동 닫기
    timerRef.current = setTimeout(() => dismiss(), 6000);
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setData(null);
    });
  }, []);

  useEffect(() => {
    registerNotificationHandler(show);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      _handler = null; // unmount 시 stale 핸들러 방지
    };
  }, [show]);

  if (!visible || !data) return null;

  const ppoomState = getStateFromFatigue(data.fatiguePercentage);
  const pct = Math.round(data.fatiguePercentage);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.5 : 0.15,
        },
      ]}>
      <TouchableOpacity
        style={styles.content}
        onPress={dismiss}
        activeOpacity={0.9}>
        {/* 뿜 이미지 */}
        <Image
          source={PPOOM_IMAGES[ppoomState]}
          style={styles.ppoomImage}
          resizeMode="contain"
        />

        {/* 텍스트 영역 */}
        <View style={styles.textArea}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, {color: colors.textPrimary}]} numberOfLines={1}>
              {data.title}
            </Text>
            <Text style={[styles.percentage, {color: colors.accent}]}>
              {pct}%
            </Text>
          </View>
          <Text style={[styles.body, {color: colors.textSecondary}]} numberOfLines={2}>
            {data.body}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 액션 버튼 */}
      {data.actionLabel && data.onAction && (
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: colors.accent}]}
          onPress={() => {
            data.onAction?.();
            dismiss();
          }}
          activeOpacity={0.7}>
          <Text style={styles.actionText}>{data.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: RADIUS.card,
    padding: 14,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ppoomImage: {
    width: 56,
    height: 56,
    marginRight: 12,
  },
  textArea: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  percentage: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.small,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PpoomNotification;
