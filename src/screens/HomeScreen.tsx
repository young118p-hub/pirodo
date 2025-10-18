/**
 * 홈 화면 - 현재 피로도 표시
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useFatigue} from '../contexts/FatigueContext';
import FatigueCircle from '../components/FatigueCircle';
import {FATIGUE_LEVEL_INFO, getFatigueLevelFromPercentage} from '../utils/constants';

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
  } = useFatigue();

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
    marginBottom: 30,
    alignItems: 'center',
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
