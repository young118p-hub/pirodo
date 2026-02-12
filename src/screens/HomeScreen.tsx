/**
 * 홈 화면 - 워치 게이지 + 핵심 지표 + 회복 추천 + 퀵버튼
 * V4 트렌디 UI
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
  INPUT_MODE_INFO,
} from '../utils/constants';
import {InputMode, ActivityType} from '../types';
import {getRecoveryTips} from '../utils/recoveryEngine';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

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
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  const getSliderColor = (value: number) => {
    if (value <= 25) return COLORS.fatigue.excellent;
    if (value <= 50) return COLORS.fatigue.good;
    if (value <= 75) return COLORS.fatigue.tired;
    return COLORS.fatigue.exhausted;
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
  ).slice(0, 2); // 최대 2개만

  const handleQuickAdd = (type: ActivityType) => {
    const duration = type === ActivityType.WATER ? 1 : 30;
    addActivity(type, duration);
  };

  const dateString = new Date(dailyData.date).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>피로도</Text>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{dateString}</Text>
        </View>
      </View>

      {/* 슬라이더 (Manual 모드) */}
      {inputMode === InputMode.MANUAL && (
        <View style={styles.sliderCard}>
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
            maximumTrackTintColor={COLORS.gaugeBackground}
            thumbTintColor={getSliderColor(sliderValue)}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>최고</Text>
            <Text style={[styles.sliderValueText, {color: getSliderColor(sliderValue)}]}>
              {Math.round(sliderValue)}%
            </Text>
            <Text style={styles.sliderLabelText}>탈진</Text>
          </View>
        </View>
      )}

      {/* 메인 게이지 카드 */}
      <View style={styles.gaugeCard}>
        <FatigueCircle percentage={fatiguePercentage} size={240} />
        <Text style={styles.fatigueMessage}>{fatigueMessage}</Text>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>
            {INPUT_MODE_INFO[inputMode].emoji} {dataSourceLabel}
          </Text>
        </View>
      </View>

      {/* 핵심 지표 3개 */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, {backgroundColor: COLORS.metricBg.steps}]}>
          <Text style={styles.metricIcon}>👟</Text>
          <Text style={styles.metricValue}>
            {inputMode === InputMode.MANUAL
              ? dailyData.activities.length
              : healthData?.stepCount?.toLocaleString() ?? '--'}
          </Text>
          <Text style={styles.metricLabel}>
            {inputMode === InputMode.MANUAL ? '활동' : '걸음'}
          </Text>
        </View>

        <View style={[styles.metricCard, {backgroundColor: COLORS.metricBg.sleep}]}>
          <Text style={styles.metricIcon}>🌙</Text>
          <Text style={styles.metricValue}>{formatSleepHours()}</Text>
          <Text style={styles.metricLabel}>수면</Text>
        </View>

        <View style={[styles.metricCard, {backgroundColor: healthData?.heartRate != null ? COLORS.metricBg.heart : COLORS.metricBg.sitting}]}>
          <Text style={styles.metricIcon}>
            {healthData?.heartRate != null ? '❤️' : '🪑'}
          </Text>
          <Text style={styles.metricValue}>
            {healthData?.heartRate != null
              ? `${healthData.heartRate}`
              : `${healthData?.sedentaryMinutes ?? 0}분`}
          </Text>
          <Text style={styles.metricLabel}>
            {healthData?.heartRate != null ? 'bpm' : '앉아있기'}
          </Text>
        </View>
      </View>

      {/* 회복 추천 */}
      {recoveryTips.length > 0 && (
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>회복 추천</Text>
          {recoveryTips.map((tip, index) => (
            <View
              key={index}
              style={[
                styles.tipItem,
                index < recoveryTips.length - 1 && styles.tipItemBorder,
              ]}>
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
      <View style={styles.quickSection}>
        <Text style={styles.quickTitle}>빠른 기록</Text>
        <View style={styles.quickRow}>
          {[
            {type: ActivityType.CAFFEINE, icon: '☕', label: '커피'},
            {type: ActivityType.WATER, icon: '💧', label: '물'},
            {type: ActivityType.REST, icon: '🛋️', label: '휴식'},
            {type: ActivityType.EXERCISE, icon: '🏃', label: '운동'},
          ].map((item) => (
            <TouchableOpacity
              key={item.type}
              style={styles.quickButton}
              onPress={() => handleQuickAdd(item.type)}
              activeOpacity={0.6}>
              <View style={styles.quickIconCircle}>
                <Text style={styles.quickIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 하단 액션 버튼 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddActivity')}
          activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ 활동 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('Details')}
          activeOpacity={0.7}>
          <Text style={styles.detailButtonText}>상세 보기</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...TYPOGRAPHY.title,
  },
  datePill: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
  },

  // 슬라이더
  sliderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  sliderLabel: {
    ...TYPOGRAPHY.heading,
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
    ...TYPOGRAPHY.small,
  },
  sliderValueText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // 메인 게이지 카드
  gaugeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.cardLarge,
    padding: 28,
    alignItems: 'center',
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  fatigueMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  sourceBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  sourceBadgeText: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
  },

  // 핵심 지표
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.sectionGap,
  },
  metricCard: {
    flex: 1,
    borderRadius: RADIUS.card,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    ...TYPOGRAPHY.small,
  },

  // 회복 추천
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  tipsTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  tipItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 1,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // 퀵 버튼
  quickSection: {
    marginBottom: SPACING.sectionGap,
  },
  quickTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    alignItems: 'center',
  },
  quickIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...SHADOWS.subtle,
  },
  quickIcon: {
    fontSize: 24,
  },
  quickLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  // 하단 액션 버튼
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.small,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.small,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  detailButtonText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;
