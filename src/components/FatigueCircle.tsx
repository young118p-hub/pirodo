/**
 * 피로도를 원형으로 표시하는 컴포넌트
 */

import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {FatigueLevel} from '../types';
import {FATIGUE_LEVEL_INFO, getFatigueLevelFromPercentage} from '../utils/constants';

interface FatigueCircleProps {
  percentage: number;
  size?: number;
}

const FatigueCircle: React.FC<FatigueCircleProps> = ({
  percentage,
  size = 250,
}) => {
  const level = getFatigueLevelFromPercentage(percentage);
  const info = FATIGUE_LEVEL_INFO[level];

  const radius = size / 2 - 20;
  const strokeWidth = 20;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      {/* 배경 원 */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#E0E0E0',
          },
        ]}
      />

      {/* 피로도 표시 원 (간단한 버전 - SVG 없이) */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: info.color,
            opacity: 0.8,
          },
        ]}
      />

      {/* 중앙 정보 */}
      <View style={styles.centerContent}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <Text style={[styles.percentage, {color: info.color}]}>
          {percentage}%
        </Text>
        <Text style={styles.levelName}>{info.displayName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  levelName: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
});

export default FatigueCircle;
