/**
 * 스트릭 표시 배지
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import {getStreakBonusLabel} from '../utils/streakEngine';
import {RADIUS} from '../utils/theme';

const StreakBadge: React.FC = () => {
  const {streak} = usePpoom();
  const {colors, isDark} = useTheme();

  if (streak.currentStreak === 0) return null;

  const bonusLabel = getStreakBonusLabel(streak.currentStreak);

  return (
    <View style={[styles.container, {backgroundColor: isDark ? '#2E2418' : '#FFF5EB'}]}>
      <Text style={styles.fireEmoji}>🔥</Text>
      <Text style={[styles.streakText, {color: colors.textPrimary}]}>
        {streak.currentStreak}일 연속
      </Text>
      {bonusLabel && (
        <View style={[styles.bonusBadge, {backgroundColor: colors.accent}]}>
          <Text style={styles.bonusText}>{bonusLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
    gap: 6,
  },
  fireEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bonusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bonusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default StreakBadge;
