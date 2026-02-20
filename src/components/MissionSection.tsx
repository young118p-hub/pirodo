/**
 * 오늘의 미션 섹션 래퍼
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import MissionCard from './MissionCard';
import {TYPOGRAPHY, SPACING} from '../utils/theme';

const MissionSection: React.FC = () => {
  const {todayMissions, allMissionsCompleted, completeMission} = usePpoom();
  const {colors} = useTheme();

  if (todayMissions.length === 0) return null;

  const completedCount = todayMissions.filter(m => m.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>오늘의 미션</Text>
        <Text style={[styles.counter, {color: colors.textSecondary}]}>
          {completedCount}/{todayMissions.length}
        </Text>
      </View>

      {allMissionsCompleted && (
        <View style={[styles.completeBanner, {backgroundColor: colors.accentLight}]}>
          <Text style={[styles.completeText, {color: colors.accent}]}>
            🎉 오늘의 미션 모두 완료! 대단해!
          </Text>
        </View>
      )}

      {todayMissions.map(mission => (
        <MissionCard
          key={mission.templateId}
          mission={mission}
          onComplete={() => completeMission(mission.templateId)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sectionGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...TYPOGRAPHY.heading,
  },
  counter: {
    ...TYPOGRAPHY.caption,
  },
  completeBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MissionSection;
