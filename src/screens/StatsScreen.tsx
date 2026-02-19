/**
 * 통계 화면 - 주간/월간 피로도 차트 + 시간대 패턴 + 요약
 * V5 데이터 시각화 강화
 */

import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import Svg, {Rect, Text as SvgText, Line, Circle, Path} from 'react-native-svg';
import {useFatigue} from '../contexts/FatigueContext';
import {DailyHistoryRecord} from '../types';
import {HistoryService} from '../services/HistoryService';
import {PatternAnalyzer, WeeklyAnalysis} from '../services/PatternAnalyzer';
import {getFatigueLevelFromPercentage, FATIGUE_LEVEL_INFO} from '../utils/constants';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

type Period = 'weekly' | 'monthly';

const screenWidth = Dimensions.get('window').width;

const StatsScreen: React.FC = () => {
  const {colors, shadows} = useTheme();
  const {fatiguePercentage, dailyData} = useFatigue();
  const [period, setPeriod] = useState<Period>('weekly');
  const [weeklyData, setWeeklyData] = useState<(DailyHistoryRecord | null)[]>([]);
  const [monthlyData, setMonthlyData] = useState<(DailyHistoryRecord | null)[]>([]);
  const [hourlyPattern, setHourlyPattern] = useState<number[]>(new Array(24).fill(0));
  const [stats, setStats] = useState<{
    avgFatigue: number;
    maxFatigue: number;
    minFatigue: number;
    avgSleep: number;
    avgSteps: number;
    worstDay: string;
    dataCount: number;
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<WeeklyAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, [fatiguePercentage]);

  const loadData = async () => {
    const [weekly, monthly, weeklyStats] = await Promise.all([
      HistoryService.getWeeklyHistory(),
      HistoryService.getMonthlyHistory(),
      HistoryService.getWeeklyStats(),
    ]);
    setWeeklyData(weekly);
    setMonthlyData(monthly);
    setStats(weeklyStats);

    // AI 패턴 분석
    const history = await HistoryService.getHistory();
    const analysis = PatternAnalyzer.analyzeWeekly(history);
    setAiAnalysis(analysis);

    // 시간대별 패턴
    const pattern = HistoryService.getHourlyPattern(
      dailyData.activities.map(a => ({
        timestamp: a.timestamp,
        type: a.type,
        durationMinutes: a.durationMinutes,
      })),
    );
    setHourlyPattern(pattern);
  };

  const getBarColor = (percentage: number) => {
    const level = getFatigueLevelFromPercentage(percentage);
    return FATIGUE_LEVEL_INFO[level].color;
  };

  const getDayLabel = (index: number, total: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (total - 1 - index));
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const getDateLabel = (index: number, total: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (total - 1 - index));
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const currentData = period === 'weekly' ? weeklyData : monthlyData;

  // 주간 바 차트
  const renderWeeklyChart = () => {
    const chartWidth = screenWidth - 80;
    const chartHeight = 180;
    const barWidth = 30;
    const barGap = (chartWidth - barWidth * 7) / 8;
    const maxBarHeight = chartHeight - 40;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {[0.25, 0.5, 0.75].map((ratio, idx) => (
          <Line
            key={idx}
            x1={0}
            y1={maxBarHeight * (1 - ratio)}
            x2={chartWidth}
            y2={maxBarHeight * (1 - ratio)}
            stroke={colors.divider}
            strokeWidth={1}
          />
        ))}
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
                fill={hasData ? getBarColor(percentage) : colors.gaugeBackground}
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
                fill={isToday ? colors.accent : colors.textSecondary}
                textAnchor="middle">
                {getDayLabel(index, 7)}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={maxBarHeight + 28}
                fontSize={9}
                fill={colors.textTertiary}
                textAnchor="middle">
                {getDateLabel(index, 7)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  // 월간 라인 차트
  const renderMonthlyChart = () => {
    const chartWidth = screenWidth - 80;
    const chartHeight = 160;
    const padding = 10;
    const graphWidth = chartWidth - padding * 2;
    const graphHeight = chartHeight - 30;

    const dataPoints = monthlyData
      .map((record, index) => ({
        x: padding + (index / 29) * graphWidth,
        y: record
          ? graphHeight - (record.fatiguePercentage / 100) * graphHeight
          : null,
        percentage: record?.fatiguePercentage ?? null,
      }));

    // 연결된 포인트들로 path 생성
    const validPoints = dataPoints.filter(p => p.y !== null);
    let pathD = '';
    validPoints.forEach((point, idx) => {
      if (idx === 0) {
        pathD += `M ${point.x} ${point.y}`;
      } else {
        // 부드러운 곡선
        const prev = validPoints[idx - 1];
        const cpx = (prev.x + point.x) / 2;
        pathD += ` C ${cpx} ${prev.y} ${cpx} ${point.y} ${point.x} ${point.y}`;
      }
    });

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* 기준선 */}
        {[0.25, 0.5, 0.75].map((ratio, idx) => (
          <Line
            key={idx}
            x1={padding}
            y1={graphHeight * (1 - ratio)}
            x2={chartWidth - padding}
            y2={graphHeight * (1 - ratio)}
            stroke={colors.divider}
            strokeWidth={1}
          />
        ))}

        {/* 라인 */}
        {pathD && (
          <Path d={pathD} stroke={colors.accent} strokeWidth={2.5} fill="none" />
        )}

        {/* 데이터 포인트 */}
        {validPoints.map((point, idx) => (
          <Circle
            key={idx}
            cx={point.x}
            cy={point.y!}
            r={3}
            fill={getBarColor(point.percentage!)}
          />
        ))}

        {/* X축 날짜 라벨 (5일 간격) */}
        {[0, 7, 14, 21, 29].map(i => (
          <SvgText
            key={i}
            x={padding + (i / 29) * graphWidth}
            y={chartHeight - 2}
            fontSize={9}
            fill={colors.textTertiary}
            textAnchor="middle">
            {getDateLabel(i, 30)}
          </SvgText>
        ))}
      </Svg>
    );
  };

  // 시간대별 패턴 차트
  const renderHourlyChart = () => {
    const chartWidth = screenWidth - 80;
    const chartHeight = 100;
    const barWidth = (chartWidth - 48) / 24;
    const maxVal = Math.max(...hourlyPattern.map(Math.abs), 1);

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* 중앙선 (0) */}
        <Line
          x1={0}
          y1={chartHeight / 2}
          x2={chartWidth}
          y2={chartHeight / 2}
          stroke={colors.divider}
          strokeWidth={1}
        />

        {hourlyPattern.map((val, hour) => {
          if (val === 0) return null;
          const x = 24 + hour * barWidth;
          const barH = (Math.abs(val) / maxVal) * (chartHeight / 2 - 10);
          const isFatigue = val > 0;
          const y = isFatigue ? chartHeight / 2 - barH : chartHeight / 2;

          return (
            <Rect
              key={hour}
              x={x}
              y={y}
              width={barWidth - 2}
              height={barH}
              rx={2}
              fill={isFatigue ? colors.fatigue.tired : colors.fatigue.excellent}
              opacity={0.7}
            />
          );
        })}

        {/* 시간 라벨 */}
        {[0, 6, 12, 18, 23].map(h => (
          <SvgText
            key={h}
            x={24 + h * barWidth + barWidth / 2}
            y={chartHeight - 2}
            fontSize={8}
            fill={colors.textTertiary}
            textAnchor="middle">
            {h}시
          </SvgText>
        ))}
      </Svg>
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <Text style={[styles.title, {color: colors.textPrimary}]}>통계</Text>
      <Text style={[styles.subtitle, {color: colors.textSecondary}]}>나의 피로도 트렌드</Text>

      {/* 기간 전환 탭 */}
      <View style={[styles.periodTabs, {backgroundColor: colors.surface}, shadows.subtle]}>
        {(['weekly', 'monthly'] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && [styles.periodTabActive, {backgroundColor: colors.accent}]]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.periodTabText,
                {color: colors.textSecondary},
                period === p && styles.periodTabTextActive,
              ]}>
              {p === 'weekly' ? '주간' : '월간'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 차트 */}
      <View style={[styles.chartCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={[styles.chartLabel, {color: colors.textSecondary}]}>
          {period === 'weekly' ? '최근 7일' : '최근 30일'} 피로도
        </Text>
        {period === 'weekly' ? renderWeeklyChart() : renderMonthlyChart()}
      </View>

      {/* 시간대별 패턴 */}
      <View style={[styles.chartCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={[styles.chartLabel, {color: colors.textSecondary}]}>오늘 시간대별 패턴</Text>
        <View style={styles.patternLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: colors.fatigue.tired}]} />
            <Text style={[styles.legendText, {color: colors.textTertiary}]}>피로 증가</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: colors.fatigue.excellent}]} />
            <Text style={[styles.legendText, {color: colors.textTertiary}]}>회복</Text>
          </View>
        </View>
        {renderHourlyChart()}
      </View>

      {/* 주간 요약 */}
      {stats && stats.dataCount > 0 ? (
        <>
          <View style={[styles.summaryCard, {backgroundColor: colors.surface}, shadows.card]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.textPrimary}]}>{stats.avgFatigue}%</Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>평균</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.fatigue.exhausted}]}>
                {stats.maxFatigue}%
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>최고</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.fatigue.excellent}]}>
                {stats.minFatigue}%
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>최저</Text>
            </View>
          </View>

          <View style={[styles.insightCard, {backgroundColor: colors.surface}, shadows.card]}>
            <Text style={[styles.insightTitle, {color: colors.textPrimary}]}>주간 인사이트</Text>
            {[
              {icon: '🌙', text: `평균 수면 ${stats.avgSleep}시간`},
              {icon: '👟', text: `평균 걸음수 ${stats.avgSteps.toLocaleString()}보`},
              {icon: '📅', text: `가장 피곤한 요일: ${stats.worstDay}`},
            ].map((item, idx) => (
              <View key={idx} style={styles.insightRow}>
                <Text style={styles.insightIcon}>{item.icon}</Text>
                <Text style={[styles.insightText, {color: colors.textSecondary}]}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* AI 패턴 분석 */}
          {aiAnalysis && aiAnalysis.insights.length > 0 && (
            <View style={[styles.aiCard, {backgroundColor: colors.surface}, shadows.card]}>
              <View style={styles.aiHeader}>
                <Text style={[styles.aiTitle, {color: colors.textPrimary}]}>🧠 AI 패턴 분석</Text>
                <View style={[
                  styles.trendBadge,
                  {backgroundColor: colors.accentLight},
                  aiAnalysis.trend === 'improving' && {backgroundColor: colors.fatigue.excellent + '20'},
                  aiAnalysis.trend === 'worsening' && {backgroundColor: colors.fatigue.exhausted + '20'},
                ]}>
                  <Text style={[styles.trendBadgeText, {color: colors.textPrimary}]}>
                    {aiAnalysis.trend === 'improving' ? '📈 개선' :
                     aiAnalysis.trend === 'worsening' ? '📉 주의' : '➡️ 안정'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.trendDesc, {color: colors.textSecondary}]}>{aiAnalysis.trendDescription}</Text>

              {aiAnalysis.insights.map((insight, idx) => (
                <View key={idx} style={[
                  styles.aiInsightItem,
                  {backgroundColor: colors.background},
                  insight.type === 'warning' && {backgroundColor: colors.fatigue.tired + '20'},
                  insight.type === 'positive' && {backgroundColor: colors.fatigue.excellent + '20'},
                ]}>
                  <Text style={styles.aiInsightEmoji}>{insight.emoji}</Text>
                  <View style={styles.aiInsightContent}>
                    <Text style={[styles.aiInsightTitle, {color: colors.textPrimary}]}>{insight.title}</Text>
                    <Text style={[styles.aiInsightDesc, {color: colors.textSecondary}]}>{insight.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={[styles.emptyCard, {backgroundColor: colors.surface}, shadows.card]}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>아직 데이터가 부족해요</Text>
          <Text style={[styles.emptyDesc, {color: colors.textSecondary}]}>
            매일 사용하면 여기에 통계가 표시됩니다
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
    marginBottom: 20,
  },

  // 기간 전환 탭
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.small,
    padding: 4,
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.subtle,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.small - 2,
  },
  periodTabActive: {
    backgroundColor: COLORS.accent,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTabTextActive: {
    color: COLORS.white,
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
  chartLabel: {
    ...TYPOGRAPHY.caption,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  // 패턴 범례
  patternLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...TYPOGRAPHY.small,
  },

  // 요약 카드
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

  // AI 분석 카드
  aiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginTop: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    ...TYPOGRAPHY.heading,
  },
  trendBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trendBadgeGood: {},
  trendBadgeBad: {},
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  aiInsightItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.small,
    padding: 14,
    marginBottom: 8,
  },
  aiInsightWarning: {},
  aiInsightPositive: {},
  aiInsightEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  aiInsightContent: {
    flex: 1,
  },
  aiInsightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  aiInsightDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
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
