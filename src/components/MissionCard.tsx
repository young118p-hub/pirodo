/**
 * 미션 카드 컴포넌트
 * 완료 시 +EXP 플로팅 애니메이션 포함
 */

import React, {useState, useRef, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {DailyMission, MissionDifficulty} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, TYPOGRAPHY} from '../utils/theme';

interface Props {
  mission: DailyMission;
  onComplete: () => void;
}

const DIFFICULTY_COLORS: Record<MissionDifficulty, {light: string; dark: string; label: string}> = {
  [MissionDifficulty.EASY]: {light: '#E8FAF9', dark: '#0D2E2C', label: '쉬움'},
  [MissionDifficulty.NORMAL]: {light: '#EEEDFC', dark: '#1E1D3A', label: '보통'},
  [MissionDifficulty.CHALLENGE]: {light: '#FFF5EB', dark: '#2E2418', label: '도전'},
};

const MissionCard: React.FC<Props> = ({mission, onComplete}) => {
  const {colors, shadows, isDark} = useTheme();
  const difficultyInfo = DIFFICULTY_COLORS[mission.difficulty];

  // EXP 플로팅 애니메이션
  const [showExpAnim, setShowExpAnim] = useState(false);
  const expOpacity = useRef(new Animated.Value(0)).current;
  const expTranslateY = useRef(new Animated.Value(0)).current;
  const expScale = useRef(new Animated.Value(0.5)).current;
  // 카드 완료 체크 스케일
  const checkScale = useRef(new Animated.Value(1)).current;

  const handleComplete = useCallback(() => {
    if (mission.completed) return;

    // 체크 버튼 바운스
    Animated.sequence([
      Animated.timing(checkScale, {toValue: 1.3, duration: 100, useNativeDriver: true}),
      Animated.spring(checkScale, {toValue: 1, friction: 4, useNativeDriver: true}),
    ]).start();

    // EXP 플로팅 애니메이션 시작
    setShowExpAnim(true);
    expOpacity.setValue(1);
    expTranslateY.setValue(0);
    expScale.setValue(0.5);

    Animated.parallel([
      Animated.timing(expTranslateY, {
        toValue: -50,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(expScale, {toValue: 1.2, friction: 4, useNativeDriver: true}),
        Animated.timing(expScale, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]),
      Animated.timing(expOpacity, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setShowExpAnim(false));

    onComplete();
  }, [mission.completed, onComplete]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          opacity: mission.completed ? 0.6 : 1,
        },
        shadows.card,
      ]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{mission.emoji}</Text>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  textDecorationLine: mission.completed ? 'line-through' : 'none',
                },
              ]}>
              {mission.title}
            </Text>
            <View
              style={[
                styles.difficultyBadge,
                {backgroundColor: isDark ? difficultyInfo.dark : difficultyInfo.light},
              ]}>
              <Text style={[styles.difficultyText, {color: colors.textSecondary}]}>
                {difficultyInfo.label}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, {color: colors.textSecondary}]}>
            {mission.description}
          </Text>
          <Text style={[styles.expText, {color: colors.accent}]}>
            +{mission.expReward} EXP
          </Text>
        </View>

        <Animated.View style={{transform: [{scale: checkScale}]}}>
          <TouchableOpacity
            onPress={handleComplete}
            disabled={mission.completed}
            style={[
              styles.checkButton,
              {
                backgroundColor: mission.completed ? colors.textTertiary : colors.accent,
              },
            ]}
            activeOpacity={0.7}>
            <Text style={styles.checkText}>
              {mission.completed ? '✓' : '완료'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* EXP 플로팅 텍스트 */}
      {showExpAnim && (
        <Animated.Text
          style={[
            styles.expFloat,
            {
              color: colors.accent,
              opacity: expOpacity,
              transform: [{translateY: expTranslateY}, {scale: expScale}],
            },
          ]}>
          +{mission.expReward} EXP
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: SPACING.itemGap,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    ...TYPOGRAPHY.caption,
    marginBottom: 2,
  },
  expText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.small,
    marginLeft: 8,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  expFloat: {
    position: 'absolute',
    right: 16,
    top: -10,
    fontSize: 18,
    fontWeight: '900',
  },
});

export default MissionCard;
