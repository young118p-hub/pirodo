/**
 * 통계 화면 - 주간 피로도 차트 + 요약
 * V4 트렌디 UI
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Svg, {Rect, Text as SvgText, Line} from 'react-native-svg';
import {useFatigue} from '../contexts/FatigueContext';
import {DailyHistoryRecord} from '../types';
import {HistoryService} from '../services/HistoryService';
import {getFatigueLevelFromPercentage, FATIGUE_LEVEL_INFO} from '../utils/constants';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const StatsScreen: React.FC = () => {
  const {fatiguePercentage} = useFatigue();
  const [weeklyData, setWeeklyData] = useState<(DailyHistoryRecord | null)[]>([]);
  const [stats, setStats] = useState<{
    avgFatigue: number;
    maxFatigue: number;
    minFatigue: number;
    avgSleep: number;
    avgSteps: number;
    worstDay: string;
    dataCount: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [fatiguePercentage]);

  const loadData = async () => {
    const [weekly, weeklyStats] = await Promise.all([
      HistoryService.getWeeklyHistory(),
      HistoryService.getWeeklyStats(),
    ]);
    setWeeklyData(weekly);
    setStats(weeklyStats);
  };

  const getBarColor = (percentage: number) => {
    const level = getFatigueLevelFromPercentage(percentage);
    return FATIGUE_LEVEL_INFO[level].color;
  };

  const getDayLabel = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const getDateLabel = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 바 차트 설정
  const chartWidth = 320;
  const chartHeight = 180;
  const barWidth = 30;
  const barGap = (chartWidth - barWidth * 7) / 8;
  const maxBarHeight = chartHeight - 40;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <Text style={styles.title}>주간 통계</Text>
      <Text style={styles.subtitle}>최근 7일 피로도 변화</Text>

      {/* 바 차트 */}
      <View style={styles.chartCard}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* 기준선들 */}
          {[0.25, 0.5, 0.75].map((ratio, idx) => (
            <Line
              key={idx}
              x1={0}
              y1={maxBarHeight * (1 - ratio)}
              x2={chartWidth}
              y2={maxBarHeight * (1 - ratio)}
              stroke={COLORS.divider}
              strokeWidth={1}
            />
          ))}

          {/* 바들 */}
          {weeklyData.map((record, index) => {
            const x = barGap + index * (barWidth + barGap);
            const percentage = record?.fatiguePercentage ?? 0;
            const barHeight = (percentage / 100) * maxBarHeight;
            const y = maxBarHeight - barHeight;
            const hasData = record !== null;
            const isToday = index === 6;

            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={hasData ? y : maxBarHeight - 4}
                  width={barWidth}
                  height={hasData ? Math.max(barHeight, 4) : 4}
                  rx={6}
                  fill={hasData ? getBarColor(percentage) : COLORS.gaugeBackground}
                  opacity={hasData ? 1 : 0.3}
                />
                {hasData && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 6}
                    fontSize={10}
                    fontWeight="600"
                    fill={getBarColor(percentage)}
                    textAnchor="middle">
                    {percentage}%
                  </SvgText>
                )}
                <SvgText
                  x={x + barWidth / 2}
                  y={maxBarHeight + 15}
                  fontSize={11}
                  fontWeight={isToday ? 'bold' : 'normal'}
                  fill={isToday ? COLORS.accent : COLORS.textSecondary}
                  textAnchor="middle">
                  {getDayLabel(index)}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={maxBarHeight + 28}
                  fontSize={9}
                  fill={COLORS.textTertiary}
                  textAnchor="middle">
                  {getDateLabel(index)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* 주간 요약 */}
      {stats && stats.dataCount > 0 ? (
        <>
          {/* 3개 지표 카드 통합 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.avgFatigue}%</Text>
              <Text style={styles.summaryLabel}>평균</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: COLORS.fatigue.exhausted}]}>
                {stats.maxFatigue}%
              </Text>
              <Text style={styles.summaryLabel}>최고</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: COLORS.fatigue.excellent}]}>
                {stats.minFatigue}%
              </Text>
              <Text style={styles.summaryLabel}>최저</Text>
            </View>
          </View>

          {/* 주간 인사이트 */}
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>주간 인사이트</Text>
            {[
              {icon: '🌙', text: `평균 수면 ${stats.avgSleep}시간`},
              {icon: '👟', text: `평균 걸음수 ${stats.avgSteps.toLocaleString()}보`},
              {icon: '📅', text: `가장 피곤한 요일: ${stats.worstDay}`},
            ].map((item, idx) => (
              <View key={idx} style={styles.insightRow}>
                <Text style={styles.insightIcon}>{item.icon}</Text>
                <Text style={styles.insightText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>아직 데이터가 부족해요</Text>
          <Text style={styles.emptyDesc}>
            매일 사용하면 여기에 주간 통계가 표시됩니다
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    ...TYPOGRAPHY.title,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: 24,
  },

  // 차트 카드
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.cardLarge,
    padding: SPACING.cardPadding,
    alignItems: 'center',
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },

  // 요약 카드 (3개 통합)
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 20,
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 4,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    ...TYPOGRAPHY.small,
    marginTop: 4,
  },

  // 인사이트 카드
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    ...SHADOWS.card,
  },
  insightTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  insightIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  insightText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  // 빈 상태
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.cardLarge,
    padding: 48,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 8,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default StatsScreen;
