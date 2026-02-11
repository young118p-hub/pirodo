/**
 * 홈 화면 - 현재 피로도 표시
 * V2: 슬라이더, 자동 데이터 카드, 설정 버튼 추가
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
import {InputMode} from '../types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {
    fatiguePercentage,
    fatigueMessage,
    recommendation,
    dailyData,
    isLoading,
    inputMode,
    healthData,
    dataSourceLabel,
    setManualSliderValue,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>피로도</Text>
            <Text style={styles.date}>
              {new Date(dailyData.date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* 데이터 소스 뱃지 */}
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>
            {INPUT_MODE_INFO[inputMode].emoji} {dataSourceLabel}
          </Text>
        </View>
      </View>

      {/* Tier C: 간편 슬라이더 */}
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

      {/* Tier A/B: 자동 데이터 카드 */}
      {inputMode !== InputMode.MANUAL && healthData && (
        <View style={styles.autoDataContainer}>
          <View style={styles.autoDataCard}>
            <Text style={styles.autoDataEmoji}>👟</Text>
            <Text style={styles.autoDataValue}>
              {healthData.stepCount?.toLocaleString() ?? '--'}
            </Text>
            <Text style={styles.autoDataLabel}>걸음</Text>
          </View>
          <View style={styles.autoDataCard}>
            <Text style={styles.autoDataEmoji}>😴</Text>
            <Text style={styles.autoDataValue}>{formatSleepHours()}</Text>
            <Text style={styles.autoDataLabel}>수면</Text>
          </View>
          {healthData.heartRate != null && (
            <View style={styles.autoDataCard}>
              <Text style={styles.autoDataEmoji}>❤️</Text>
              <Text style={styles.autoDataValue}>{healthData.heartRate}</Text>
              <Text style={styles.autoDataLabel}>bpm</Text>
            </View>
          )}
          {healthData.heartRate == null && (
            <View style={styles.autoDataCard}>
              <Text style={styles.autoDataEmoji}>🪑</Text>
              <Text style={styles.autoDataValue}>
                {healthData.sedentaryMinutes ?? 0}
              </Text>
              <Text style={styles.autoDataLabel}>앉아있기(분)</Text>
            </View>
          )}
        </View>
      )}

      {/* 피로도 원 */}
      <View style={styles.circleContainer}>
        <FatigueCircle percentage={fatiguePercentage} size={280} />
      </View>

      {/* 메시지 */}
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{fatigueMessage}</Text>
        <View style={[styles.badge, {backgroundColor: levelInfo.color}]}>
          <Text style={styles.badgeText}>{levelInfo.message}</Text>
        </View>
      </View>

      {/* 추천 사항 */}
      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationTitle}>💡 추천</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>

      {/* 활동 요약 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>오늘의 활동</Text>
        <Text style={styles.summaryText}>
          총 {dailyData.activities.length}개의 활동 기록
          {dailyData.activities.filter(a => a.autoGenerated).length > 0 &&
            ` (자동 ${dailyData.activities.filter(a => a.autoGenerated).length}개)`}
        </Text>
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('AddActivity')}>
          <Text style={styles.buttonText}>+ 활동 추가</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Details')}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            상세 보기
          </Text>
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
    paddingBottom: 40,
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
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 28,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  sourceBadgeText: {
    fontSize: 12,
    color: '#1967D2',
    fontWeight: '500',
  },
  // 슬라이더 (Tier C)
  sliderContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
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
    fontSize: 12,
    color: '#999',
  },
  sliderValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // 자동 데이터 카드 (Tier A/B)
  autoDataContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  autoDataCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  autoDataEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  autoDataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  autoDataLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default HomeScreen;
