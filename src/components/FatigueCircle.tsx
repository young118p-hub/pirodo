/**
 * 피로도를 SVG 도넛 원형으로 표시하는 컴포넌트
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {FATIGUE_LEVEL_INFO, getFatigueLevelFromPercentage} from '../utils/constants';

interface FatigueCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const FatigueCircle: React.FC<FatigueCircleProps> = ({
  percentage,
  size = 220,
  strokeWidth = 18,
}) => {
  const level = getFatigueLevelFromPercentage(percentage);
  const info = FATIGUE_LEVEL_INFO[level];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const center = size / 2;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {/* 배경 원 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 진행 원 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={info.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* 중앙 정보 */}
      <View style={styles.centerContent}>
        <Text style={[styles.percentage, {color: info.color}]}>
          {Math.round(percentage)}
          <Text style={styles.percentSign}>%</Text>
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
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 52,
    fontWeight: '800',
  },
  percentSign: {
    fontSize: 24,
    fontWeight: '600',
  },
  levelName: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default FatigueCircle;
