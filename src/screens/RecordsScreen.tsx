/**
 * 기록 화면 - 캘린더(미니 뿜 아이콘) + 주간 리포트 + 뿜 코멘터리
 * StatsScreen의 차트 로직을 재사용하면서 뿜 연동 추가
 */

import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useFatigue} from '../contexts/FatigueContext';
import {usePpoom} from '../contexts/PpoomContext';
import {HistoryService} from '../services/HistoryService';
import {PatternAnalyzer, WeeklyAnalysis} from '../services/PatternAnalyzer';
import {getFatigueLevelFromPercentage, FATIGUE_LEVEL_INFO} from '../utils/constants';
import {getPpoomStateFromFatigue, PPOOM_STATE_INFO} from '../constants/ppoomData';
import {getLocalDateString} from '../utils/dateUtils';
import PpoomMiniIcon from '../components/PpoomMiniIcon';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';
import {DailyHistoryRecord, PpoomState} from '../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const RecordsScreen: React.FC = () => {
  const {colors, shadows} = useTheme();
  const {fatiguePercentage, dailyData} = useFatigue();
  const {missionHistory, streak, character} = usePpoom();

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
  const [aiAnalysis, setAiAnalysis] = useState<WeeklyAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [weekly, weeklyStats] = await Promise.all([
      HistoryService.getWeeklyHistory(),
      HistoryService.getWeeklyStats(),
    ]);
    setWeeklyData(weekly);
    setStats(weeklyStats);

    const history = await HistoryService.getHistory();
    const analysis = PatternAnalyzer.analyzeWeekly(history);
    setAiAnalysis(analysis);
  };

  // 캘린더 데이터 (최근 28일)
  const calendarDays = useMemo(() => {
    const days: Array<{
      date: string;
      dayOfWeek: number;
      ppoomState: PpoomState;
      allCompleted: boolean;
      fatiguePercent: number;
      hasData: boolean;
    }> = [];

    const missionMap = new Map(missionHistory.map(m => [m.date, m]));

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const missionRecord = missionMap.get(dateStr);
      const fatigue = missionRecord?.fatiguePercentage ?? 50;

      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        ppoomState: getPpoomStateFromFatigue(fatigue),
        allCompleted: missionRecord?.allCompleted ?? false,
        fatiguePercent: fatigue,
        hasData: !!missionRecord,
      });
    }
    return days;
  }, [missionHistory]);

  // 뿜 주간 코멘터리
  const ppoomCommentary = useMemo(() => {
    if (!stats || stats.dataCount === 0) return '아직 데이터가 부족해... 좀 더 사용해봐!';
    if (stats.avgFatigue <= 30) return '이번 주 컨디션 최고였어! 이대로 유지하자! ⚡';
    if (stats.avgFatigue <= 50) return '무난한 한 주였어! 조금만 더 관리하면 완벽해! 😊';
    if (stats.avgFatigue <= 70) return '이번 주 좀 힘들었지? 다음 주는 더 쉬어가자! 😮‍💨';
    return '이번 주 많이 힘들었구나... 충분히 쉬어야 해! 😴';
  }, [stats]);

  const getDateDay = (dateStr: string) => {
    return parseInt(dateStr.split('-')[2], 10);
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>기록</Text>
      </View>

      {/* 뿜 코멘터리 */}
      <View style={[styles.commentaryCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={styles.commentaryEmoji}>
          {PPOOM_STATE_INFO[getPpoomStateFromFatigue(stats?.avgFatigue ?? 50)].emoji}
        </Text>
        <Text style={[styles.commentaryText, {color: colors.textPrimary}]}>
          {ppoomCommentary}
        </Text>
      </View>

      {/* 미니 캘린더 (28일) */}
      <View style={[styles.calendarCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>최근 4주</Text>

        {/* 요일 헤더 */}
        <View style={styles.calendarWeekRow}>
          {WEEKDAYS.map(day => (
            <View key={day} style={styles.calendarCell}>
              <Text style={[styles.weekdayText, {color: colors.textTertiary}]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* 날짜 그리드 */}
        {Array.from({length: 4}).map((_, weekIdx) => (
          <View key={weekIdx} style={styles.calendarWeekRow}>
            {Array.from({length: 7}).map((__, dayIdx) => {
              const idx = weekIdx * 7 + dayIdx;
              const day = calendarDays[idx];
              if (!day) return <View key={dayIdx} style={styles.calendarCell} />;

              return (
                <View key={dayIdx} style={styles.calendarCell}>
                  {day.hasData ? (
                    <PpoomMiniIcon
                      state={day.ppoomState}
                      allCompleted={day.allCompleted}
                      size={28}
                    />
                  ) : (
                    <Text style={[styles.calendarDayText, {color: colors.textTertiary}]}>
                      {getDateDay(day.date)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* 주간 요약 */}
      {stats && stats.dataCount > 0 && (
        <View style={[styles.summaryCard, {backgroundColor: colors.surface}, shadows.card]}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>주간 요약</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.textPrimary}]}>
                {Math.round(stats.avgFatigue)}%
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>평균 피로도</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.textPrimary}]}>
                {Math.round(stats.avgSleep * 10) / 10}h
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>평균 수면</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, {color: colors.textPrimary}]}>
                {Math.round(stats.avgSteps).toLocaleString()}
              </Text>
              <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>평균 걸음</Text>
            </View>
          </View>
        </View>
      )}

      {/* 주간 피로도 바 차트 */}
      <View style={[styles.chartCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>주간 피로도</Text>
        <View style={styles.barChartContainer}>
          {weeklyData.map((record, idx) => {
            const pct = record?.fatiguePercentage ?? 0;
            const hasData = !!record;
            const date = new Date();
            date.setDate(date.getDate() - (6 - idx));
            const dayLabel = WEEKDAYS[date.getDay()];
            const levelColor = hasData
              ? FATIGUE_LEVEL_INFO[getFatigueLevelFromPercentage(pct)].color
              : colors.textTertiary;

            return (
              <View key={idx} style={styles.barItem}>
                <Text style={[styles.barValue, {color: colors.textSecondary}]}>
                  {hasData ? Math.round(pct) : ''}
                </Text>
                <View style={[styles.barTrack, {backgroundColor: colors.divider}]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${hasData ? Math.max(pct, 5) : 0}%`,
                        backgroundColor: levelColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, {color: colors.textTertiary}]}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* AI 분석 */}
      {aiAnalysis && aiAnalysis.insights.length > 0 && (
        <View style={[styles.insightCard, {backgroundColor: colors.surface}, shadows.card]}>
          <View style={styles.insightHeader}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>AI 분석</Text>
            <View style={[styles.trendBadge, {
              backgroundColor: aiAnalysis.trend === 'improving'
                ? '#E8FAF9' : aiAnalysis.trend === 'worsening' ? '#FFF0F0' : colors.accentLight,
            }]}>
              <Text style={styles.trendEmoji}>
                {aiAnalysis.trend === 'improving' ? '📈' : aiAnalysis.trend === 'worsening' ? '📉' : '➡️'}
              </Text>
            </View>
          </View>
          <Text style={[styles.insightDescription, {color: colors.textSecondary}]}>
            {aiAnalysis.trendDescription}
          </Text>
          {aiAnalysis.insights.slice(0, 3).map((insight, idx) => (
            <View key={idx} style={styles.insightItem}>
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <View style={styles.insightContent}>
                <Text style={[styles.insightTitle, {color: colors.textPrimary}]}>{insight.title}</Text>
                <Text style={[styles.insightDesc, {color: colors.textSecondary}]}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 미션 통계 */}
      <View style={[styles.missionStatsCard, {backgroundColor: colors.surface}, shadows.card]}>
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>미션 기록</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, {color: colors.accent}]}>
              {streak.currentStreak}일
            </Text>
            <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>연속 달성</Text>
          </View>
          <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, {color: colors.accent}]}>
              {streak.longestStreak}일
            </Text>
            <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>최장 기록</Text>
          </View>
          <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, {color: colors.accent}]}>
              Lv.{character.level}
            </Text>
            <Text style={[styles.summaryLabel, {color: colors.textTertiary}]}>뿜 레벨</Text>
          </View>
        </View>
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

  // 코멘터리
  commentaryCard: {
    borderRadius: RADIUS.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.sectionGap,
  },
  commentaryEmoji: {
    fontSize: 28,
  },
  commentaryText: {
    flex: 1,
    ...TYPOGRAPHY.body,
  },

  // 캘린더
  calendarCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 12,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    ...TYPOGRAPHY.small,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // 요약
  summaryCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    ...TYPOGRAPHY.small,
  },
  summaryDivider: {
    width: 1,
    height: 30,
  },

  // 바 차트
  chartCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  barTrack: {
    width: 24,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    ...TYPOGRAPHY.small,
  },

  // AI 분석
  insightCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendEmoji: {
    fontSize: 16,
  },
  insightDescription: {
    ...TYPOGRAPHY.body,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  insightEmoji: {
    fontSize: 18,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  insightDesc: {
    ...TYPOGRAPHY.caption,
  },

  // 미션 통계
  missionStatsCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
  },
});

export default RecordsScreen;
