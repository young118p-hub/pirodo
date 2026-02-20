/**
 * 옷장 화면 - 코스튬 목록 + 뿜 프리뷰 + 장착/해제
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import PpoomCharacter from '../components/PpoomCharacter';
import CostumeCard from '../components/CostumeCard';
import {CostumeRarity} from '../types';
import {COLORS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

type CategoryFilter = 'all' | CostumeRarity;

const FILTER_OPTIONS: {key: CategoryFilter; label: string}[] = [
  {key: 'all', label: '전체'},
  {key: 'common', label: '일반'},
  {key: 'rare', label: '희귀'},
  {key: 'epic', label: '에픽'},
  {key: 'legendary', label: '전설'},
];

const ClosetScreen: React.FC = () => {
  const {colors, shadows} = useTheme();
  const {allCostumes, unlockedCostumes, equipCostume, isCostumeUnlocked, character} = usePpoom();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredCostumes = filter === 'all'
    ? allCostumes
    : allCostumes.filter(c => c.rarity === filter);

  const unlockedCount = unlockedCostumes.length;
  const totalCount = allCostumes.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>옷장</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {unlockedCount}/{totalCount} 해금 ({progress}%)
        </Text>
      </View>

      {/* 뿜 프리뷰 */}
      <View style={[styles.previewCard, {backgroundColor: colors.surface}, shadows.card]}>
        <PpoomCharacter maxSize={160} />
      </View>

      {/* 해금 진행도 바 */}
      <View style={[styles.progressCard, {backgroundColor: colors.surface}, shadows.card]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, {color: colors.textPrimary}]}>수집 진행도</Text>
          <Text style={[styles.progressPercent, {color: colors.accent}]}>{progress}%</Text>
        </View>
        <View style={[styles.progressTrack, {backgroundColor: colors.divider}]}>
          <View style={[styles.progressFill, {width: `${progress}%`, backgroundColor: colors.accent}]} />
        </View>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map(opt => (
            <View
              key={opt.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === opt.key ? colors.accent : colors.surface,
                },
              ]}>
              <Text
                onPress={() => setFilter(opt.key)}
                style={[
                  styles.filterText,
                  {color: filter === opt.key ? '#FFF' : colors.textSecondary},
                ]}>
                {opt.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 코스튬 그리드 */}
      <View style={styles.grid}>
        {filteredCostumes.map(costume => (
          <CostumeCard
            key={costume.id}
            costume={costume}
            isUnlocked={isCostumeUnlocked(costume)}
            isEquipped={character.equippedCostumeId === costume.id}
            onPress={() => equipCostume(costume.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    marginTop: 4,
  },

  // 프리뷰
  previewCard: {
    borderRadius: RADIUS.cardLarge,
    padding: 24,
    alignItems: 'center',
    marginBottom: SPACING.sectionGap,
  },

  // 진행도
  progressCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  progressPercent: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // 필터
  filterScroll: {
    marginBottom: SPACING.sectionGap,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // 그리드
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ClosetScreen;
