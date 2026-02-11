/**
 * 홈 화면 - 도넛 차트 + 핵심 지표 + 회복 추천 + 퀵버튼
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {useFatigue} from '../contexts/FatigueContext';
import FatigueCircle from '../components/FatigueCircle';
import {
  FATIGUE_LEVEL_INFO,
  getFatigueLevelFromPercentage,
  INPUT_MODE_INFO,
} from '../utils/constants';
import {InputMode, ActivityType} from '../types';
import {getRecoveryTips} from '../utils/recoveryEngine';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {
    fatiguePercentage,
    fatigueMessage,
    dailyData,
    isLoading,
    inputMode,
    healthData,
    dataSourceLabel,
    setManualSliderValue,
    addActivity,
  } = useFatigue();

  const [sliderValue, setSliderValue] = useState(
    dailyData.manualSliderValue ?? 50,
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  const level = getFatigueLevelFromPercentage(fatiguePercentage);
  const levelInfo = FATIGUE_LEVEL_INFO[level];

  const getSliderColor = (value: number) => {
    if (value <= 25) return '#4CAF50';
    if (value <= 50) return '#8BC34A';
    if (value <= 75) return '#FF9800';
    return '#F44336';
  };

  const formatSleepHours = () => {
    const sleep = healthData?.sleepData ?? healthData?.estimatedSleepData;
    if (!sleep) return '--';
    const hours = Math.floor(sleep.totalMinutes / 60);
    const mins = sleep.totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const recoveryTips = getRecoveryTips(
    fatiguePercentage,
    healthData,
    dailyData.activities,
  );

  // 퀵버튼 핸들러
  const handleQuickAdd = (type: ActivityType, label: string) => {
    const duration = type === ActivityType.WATER ? 1 : 30;
    addActivity(type, duration);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>피로도</Text>
        <Text style={styles.date}>
          {new Date(dailyData.date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </Text>
      </View>

      {/* Tier C: 슬라이더 */}
      {inputMode === InputMode.MANUAL && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>지금 컨디션 어때?</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            onSlidingComplete={(value: number) => {
              setSliderValue(value);
              setManualSliderValue(value);
            }}
            minimumTrackTintColor={getSliderColor(sliderValue)}
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor={getSliderColor(sliderValue)}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>컨디션 최고</Text>
            <Text style={styles.sliderValueText}>{Math.round(sliderValue)}%</Text>
            <Text style={styles.sliderLabelText}>완전 탈진</Text>
          </View>
        </View>
      )}

      {/* 도넛 차트 */}
      <View style={styles.circleContainer}>
        <FatigueCircle percentage={fatiguePercentage} size={220} />
        <Text style={styles.fatigueMessage}>{fatigueMessage}</Text>
      </View>

      {/* 핵심 지표 행 (급여앱 스타일) */}
      <View style={styles.metricsCard}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {inputMode === InputMode.MANUAL ? '활동' : '걸음수'}
          </Text>
          <Text style={styles.metricValue}>
            {inputMode === InputMode.MANUAL
              ? dailyData.activities.length
              : healthData?.stepCount?.toLocaleString() ?? '--'}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>수면</Text>
          <Text style={styles.metricValue}>{formatSleepHours()}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {healthData?.heartRate != null ? '심박수' : '앉아있기'}
          </Text>
          <Text style={styles.metricValue}>
            {healthData?.heartRate != null
              ? `${healthData.heartRate} bpm`
              : `${healthData?.sedentaryMinutes ?? 0}분`}
          </Text>
        </View>
      </View>

      {/* 데이터 소스 */}
      <View style={styles.sourceBadge}>
        <Text style={styles.sourceBadgeText}>
          {INPUT_MODE_INFO[inputMode].emoji} {dataSourceLabel}
        </Text>
      </View>

      {/* 회복 추천 */}
      {recoveryTips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>회복 추천</Text>
          {recoveryTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 퀵 버튼 */}
      <View style={styles.quickButtonsContainer}>
        <Text style={styles.quickTitle}>빠른 기록</Text>
        <View style={styles.quickButtonRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(ActivityType.CAFFEINE, '커피')}>
            <Text style={styles.quickEmoji}>☕</Text>
            <Text style={styles.quickLabel}>커피</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(ActivityType.WATER, '물')}>
            <Text style={styles.quickEmoji}>💧</Text>
            <Text style={styles.quickLabel}>물</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(ActivityType.REST, '휴식')}>
            <Text style={styles.quickEmoji}>🛋️</Text>
            <Text style={styles.quickLabel}>휴식</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(ActivityType.EXERCISE, '운동')}>
            <Text style={styles.quickEmoji}>🏃</Text>
            <Text style={styles.quickLabel}>운동</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 상세 버튼 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddActivity')}>
          <Text style={styles.addButtonText}>+ 활동 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('Details')}>
          <Text style={styles.detailButtonText}>상세 보기</Text>
        </TouchableOpacity>
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
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // 헤더
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  // 슬라이더
  sliderContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#999',
  },
  sliderValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  // 도넛 차트
  circleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fatigueMessage: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  // 핵심 지표
  metricsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },
  // 소스 뱃지
  sourceBadge: {
    alignSelf: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  sourceBadgeText: {
    fontSize: 12,
    color: '#1967D2',
    fontWeight: '500',
  },
  // 회복 추천
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  // 퀵 버튼
  quickButtonsContainer: {
    marginBottom: 16,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quickButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  // 하단 버튼
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  detailButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;
