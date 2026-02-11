/**
 * 통계 화면 - 주간 피로도 차트 + 요약
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Svg, {Rect, Text as SvgText, Line} from 'react-native-svg';
import {useFatigue} from '../contexts/FatigueContext';
import {DailyHistoryRecord} from '../types';
import {HistoryService} from '../services/HistoryService';
import {getFatigueLevelFromPercentage, FATIGUE_LEVEL_INFO} from '../utils/constants';

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
  const barWidth = 32;
  const barGap = (chartWidth - barWidth * 7) / 8;
  const maxBarHeight = chartHeight - 40;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 헤더 */}
        <Text style={styles.title}>주간 통계</Text>
        <Text style={styles.subtitle}>최근 7일 피로도 변화</Text>

        {/* 바 차트 */}
        <View style={styles.chartCard}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* 기준선들 */}
            <Line
              x1={0} y1={maxBarHeight * 0.2}
              x2={chartWidth} y2={maxBarHeight * 0.2}
              stroke="#F0F0F0" strokeWidth={1}
            />
            <Line
              x1={0} y1={maxBarHeight * 0.5}
              x2={chartWidth} y2={maxBarHeight * 0.5}
              stroke="#F0F0F0" strokeWidth={1}
            />
            <Line
              x1={0} y1={maxBarHeight * 0.8}
              x2={chartWidth} y2={maxBarHeight * 0.8}
              stroke="#F0F0F0" strokeWidth={1}
            />

            {/* 바들 */}
            {weeklyData.map((record, index) => {
              const x = barGap + index * (barWidth + barGap);
              const percentage = record?.fatiguePercentage ?? 0;
              const barHeight = (percentage / 100) * maxBarHeight;
              const y = maxBarHeight - barHeight;
              const hasData = record !== null;

              return (
                <React.Fragment key={index}>
                  {/* 바 */}
                  <Rect
                    x={x}
                    y={hasData ? y : maxBarHeight - 4}
                    width={barWidth}
                    height={hasData ? Math.max(barHeight, 4) : 4}
                    rx={4}
                    fill={hasData ? getBarColor(percentage) : '#E0E0E0'}
                    opacity={hasData ? 1 : 0.3}
                  />
                  {/* 퍼센트 라벨 */}
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
                  {/* 요일 라벨 */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={maxBarHeight + 15}
                    fontSize={11}
                    fontWeight={index === 6 ? 'bold' : 'normal'}
                    fill={index === 6 ? '#007AFF' : '#888'}
                    textAnchor="middle">
                    {getDayLabel(index)}
                  </SvgText>
                  {/* 날짜 라벨 */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={maxBarHeight + 28}
                    fontSize={9}
                    fill="#BBB"
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
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{stats.avgFatigue}%</Text>
                <Text style={styles.summaryLabel}>평균 피로도</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, {color: '#F44336'}]}>
                  {stats.maxFatigue}%
                </Text>
                <Text style={styles.summaryLabel}>최고 피로도</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, {color: '#4CAF50'}]}>
                  {stats.minFatigue}%
                </Text>
                <Text style={styles.summaryLabel}>최저 피로도</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>주간 인사이트</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailEmoji}>😴</Text>
                <Text style={styles.detailText}>
                  평균 수면 {stats.avgSleep}시간
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailEmoji}>👟</Text>
                <Text style={styles.detailText}>
                  평균 걸음수 {stats.avgSteps.toLocaleString()}보
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailEmoji}>📅</Text>
                <Text style={styles.detailText}>
                  가장 피곤한 요일: {stats.worstDay}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>아직 데이터가 부족해요</Text>
            <Text style={styles.emptyDesc}>
              매일 사용하면 여기에 주간 통계가 표시됩니다
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default StatsScreen;
