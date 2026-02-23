/**
 * 홈 화면 - 워치 게이지 + 핵심 지표 + 회복 추천 + 퀵버튼
 * V4 트렌디 UI
 */

import React, {useState, useEffect} from 'react';
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
import {InputMode} from '../types';
import {ActivityType} from '../types';
import {getRecoveryTips} from '../utils/recoveryEngine';
import RecoveryCard from '../components/RecoveryCard';
import PpoomCharacter from '../components/PpoomCharacter';
import PpoomDialogue from '../components/PpoomDialogue';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {colors, shadows} = useTheme();
  const {dialogue, refreshDialogue} = usePpoom();
  const {
    fatiguePercentage,
    fatigueMessage,
    dailyData,
    isLoading,
    inputMode,
    healthData,
    setManualSliderValue,
    addActivity,
  } = useFatigue();

  const [sliderValue, setSliderValue] = useState(
    dailyData.manualSliderValue ?? 50,
  );

  // 데이터 로드 완료 후 슬라이더 싱크
  useEffect(() => {
    if (!isLoading) {
      setSliderValue(dailyData.manualSliderValue ?? 50);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>로딩 중...</Text>
      </View>
    );
  }

  const getFatigueColor = (value: number) => {
    if (value <= 25) return COLORS.fatigue.excellent;
    if (value <= 50) return COLORS.fatigue.good;
    if (value <= 75) return COLORS.fatigue.tired;
    return COLORS.fatigue.exhausted;
  };

  const getSliderColor = getFatigueColor;

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

  const [dateY, dateM, dateD] = dailyData.date.split('-').map(Number);
  const dateString = new Date(dateY, dateM - 1, dateD).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '새벽이에요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '오늘도 수고했어요';
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, {color: colors.textSecondary}]}>{getGreeting()}</Text>
          <Text style={[styles.title, {color: colors.textPrimary}]}>피로도</Text>
        </View>
        <View style={[styles.datePill, {backgroundColor: colors.accentLight}]}>
          <Text style={[styles.dateText, {color: colors.accent}]}>{dateString}</Text>
        </View>
      </View>

      {/* 슬라이더 (Manual 모드) */}
      {inputMode === InputMode.MANUAL && (
        <View style={[styles.sliderCard, {backgroundColor: colors.surface}, shadows.card]}>
          <Text style={[styles.sliderLabel, {color: colors.textPrimary}]}>지금 컨디션 어때?</Text>
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
            <Text style={[styles.sliderLabelText, {color: colors.textTertiary}]}>피로 0%</Text>
            <Text style={[styles.sliderValueText, {color: getSliderColor(sliderValue)}]}>
              {Math.round(sliderValue)}%
            </Text>
            <Text style={[styles.sliderLabelText, {color: colors.textTertiary}]}>피로 100%</Text>
          </View>
        </View>
      )}

      {/* 피로도 프로그레스 바 */}
      <View style={[styles.fatigueBarCard, {backgroundColor: colors.surface}, shadows.card]}>
        <View style={styles.fatigueBarHeader}>
          <Text style={[styles.fatigueBarLabel, {color: colors.textSecondary}]}>피로도</Text>
          <Text style={[styles.fatigueBarValue, {color: getFatigueColor(fatiguePercentage)}]}>
            {Math.round(fatiguePercentage)}%
          </Text>
        </View>
        <View style={[styles.fatigueBarTrack, {backgroundColor: colors.gaugeBackground}]}>
          <View
            style={[
              styles.fatigueBarFill,
              {
                width: `${Math.min(fatiguePercentage, 100)}%`,
                backgroundColor: getFatigueColor(fatiguePercentage),
              },
            ]}
          />
        </View>
        <Text style={[styles.fatigueBarMessage, {color: colors.textTertiary}]}>{fatigueMessage}</Text>
      </View>

      {/* 뿜 캐릭터 */}
      <View style={styles.ppoomSection}>
        <PpoomCharacter maxSize={200} />
        <View style={styles.dialogueWrap}>
          <PpoomDialogue text={dialogue} onTap={refreshDialogue} />
        </View>
      </View>

      {/* 핵심 지표 3개 */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, {backgroundColor: colors.metricBg.steps}]}>
          <Text style={styles.metricIcon}>👟</Text>
          <Text style={[styles.metricValue, {color: colors.textPrimary}]} adjustsFontSizeToFit numberOfLines={1}>
            {inputMode === InputMode.MANUAL
              ? dailyData.activities.length
              : healthData?.stepCount?.toLocaleString() ?? '--'}
          </Text>
          <Text style={[styles.metricLabel, {color: colors.textTertiary}]}>
            {inputMode === InputMode.MANUAL ? '활동' : '걸음'}
          </Text>
        </View>

        <View style={[styles.metricCard, {backgroundColor: colors.metricBg.sleep}]}>
          <Text style={styles.metricIcon}>🌙</Text>
          <Text style={[styles.metricValue, {color: colors.textPrimary}]} adjustsFontSizeToFit numberOfLines={1}>{formatSleepHours()}</Text>
          <Text style={[styles.metricLabel, {color: colors.textTertiary}]}>수면</Text>
        </View>

        <View style={[styles.metricCard, {backgroundColor: healthData?.heartRate != null ? colors.metricBg.heart : colors.metricBg.sitting}]}>
          <Text style={styles.metricIcon}>
            {healthData?.heartRate != null ? '❤️' : '🪑'}
          </Text>
          <Text style={[styles.metricValue, {color: colors.textPrimary}]} adjustsFontSizeToFit numberOfLines={1}>
            {healthData?.heartRate != null
              ? `${healthData.heartRate}`
              : `${healthData?.sedentaryMinutes ?? 0}분`}
          </Text>
          <Text style={[styles.metricLabel, {color: colors.textTertiary}]}>
            {healthData?.heartRate != null ? 'bpm' : '앉아있기'}
          </Text>
        </View>
      </View>

      {/* 회복 추천 (액션 카드) */}
      {recoveryTips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, {color: colors.textPrimary}]}>회복 추천</Text>
          {recoveryTips.map((tip, index) => (
            <RecoveryCard
              key={index}
              tip={tip}
              onQuickAdd={(type, duration) => addActivity(type, duration)}
            />
          ))}
        </View>
      )}

      {/* 퀵 버튼 */}
      <View style={styles.quickSection}>
        <Text style={[styles.quickTitle, {color: colors.textPrimary}]}>빠른 기록</Text>
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
              <View style={[styles.quickIconCircle, {backgroundColor: colors.surface}, shadows.subtle]}>
                <Text style={styles.quickIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.quickLabel, {color: colors.textSecondary}]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 하단 액션 버튼 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: colors.accent}]}
          onPress={() => navigation.navigate('AddActivity')}
          activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ 활동 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.detailButton, {backgroundColor: colors.surface, borderColor: colors.accent}]}
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
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: 2,
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

  // 피로도 프로그레스 바
  fatigueBarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.sectionGap,
    ...SHADOWS.card,
  },
  fatigueBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fatigueBarLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  fatigueBarValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  fatigueBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fatigueBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  fatigueBarMessage: {
    ...TYPOGRAPHY.caption,
    marginTop: 8,
  },

  // 뿜 캐릭터
  ppoomSection: {
    alignItems: 'center',
    marginBottom: SPACING.sectionGap,
  },
  dialogueWrap: {
    marginTop: 12,
    width: '100%',
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
  tipsSection: {
    marginBottom: SPACING.sectionGap,
  },
  tipsTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  quickIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    borderRadius: RADIUS.card,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  detailButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
