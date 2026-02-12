/**
 * 회복 추천 카드 - 액션 버튼 + 타이머 기능
 */

import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Vibration} from 'react-native';
import {RecoveryTip, ActivityType} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SHADOWS, SPACING, RADIUS} from '../utils/theme';

interface RecoveryCardProps {
  tip: RecoveryTip;
  onQuickAdd?: (type: ActivityType, duration: number) => void;
}

const RecoveryCard: React.FC<RecoveryCardProps> = ({tip, onQuickAdd}) => {
  const {colors, shadows} = useTheme();
  const [timerActive, setTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerActive && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setTimerActive(false);
            setTimerDone(true);
            Vibration.vibrate([0, 500, 200, 500]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, remainingSeconds]);

  const startTimer = () => {
    if (!tip.action?.timerMinutes) return;
    const totalSeconds = Math.round(tip.action.timerMinutes * 60);
    setRemainingSeconds(totalSeconds);
    setTimerActive(true);
    setTimerDone(false);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerActive(false);
    setRemainingSeconds(0);
  };

  const handleAction = () => {
    if (!tip.action) return;

    if (tip.action.type === 'timer') {
      if (timerActive) {
        stopTimer();
      } else {
        startTimer();
      }
    } else if (tip.action.type === 'quick_add' && onQuickAdd) {
      onQuickAdd(
        tip.action.activityType!,
        tip.action.activityDuration ?? 1,
      );
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = tip.action?.timerMinutes
    ? 1 - remainingSeconds / (tip.action.timerMinutes * 60)
    : 0;

  return (
    <View style={[styles.card, {backgroundColor: colors.surface}, shadows.card]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{tip.emoji}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.textPrimary}]}>{tip.title}</Text>
          <Text style={[styles.description, {color: colors.textSecondary}]}>{tip.description}</Text>
        </View>
      </View>

      {/* 타이머 표시 */}
      {timerActive && (
        <View style={styles.timerSection}>
          <View style={[styles.timerBarBg, {backgroundColor: colors.gaugeBackground}]}>
            <View
              style={[
                styles.timerBarFill,
                {width: `${Math.min(progress * 100, 100)}%`, backgroundColor: colors.accent},
              ]}
            />
          </View>
          <Text style={[styles.timerText, {color: colors.accent}]}>{formatTime(remainingSeconds)}</Text>
        </View>
      )}

      {/* 완료 메시지 */}
      {timerDone && !timerActive && (
        <View style={styles.doneSection}>
          <Text style={[styles.doneText, {color: colors.fatigue.excellent}]}>완료! 수고했어요 💪</Text>
        </View>
      )}

      {/* 액션 버튼 */}
      {tip.action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: colors.accentLight},
            timerActive && styles.actionButtonStop,
            timerDone && !timerActive && {backgroundColor: colors.accentLight},
          ]}
          onPress={handleAction}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.actionButtonText,
              {color: colors.accent},
              timerActive && styles.actionButtonTextStop,
            ]}>
            {timerActive
              ? '중지'
              : timerDone
              ? '다시 시작'
              : tip.action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: 10,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  timerSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  timerBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gaugeBackground,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  doneSection: {
    marginTop: 12,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.fatigue.excellent,
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.small,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonStop: {
    backgroundColor: '#FFF0F0',
  },
  actionButtonDone: {
    backgroundColor: COLORS.accentLight,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  actionButtonTextStop: {
    color: COLORS.fatigue.exhausted,
  },
});

export default RecoveryCard;
