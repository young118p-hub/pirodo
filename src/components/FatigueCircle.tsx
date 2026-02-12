/**
 * 피로도 워치 게이지 컴포넌트
 * 시계 스타일 60개 눈금으로 피로도 표시
 * 배터리 표시와 확실히 구별되는 디자인
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Line, Circle as SvgCircle} from 'react-native-svg';
import {FATIGUE_LEVEL_INFO, getFatigueLevelFromPercentage} from '../utils/constants';
import {COLORS} from '../utils/theme';

interface FatigueCircleProps {
  percentage: number;
  size?: number;
}

const TICK_COUNT = 60;

const FatigueCircle: React.FC<FatigueCircleProps> = ({
  percentage,
  size = 240,
}) => {
  const level = getFatigueLevelFromPercentage(percentage);
  const info = FATIGUE_LEVEL_INFO[level];

  const center = size / 2;
  const outerRadius = size / 2 - 8;
  const tickLength = 12;
  const majorTickLength = 18;
  const innerRadius = outerRadius - tickLength;

  const progress = Math.min(Math.max(percentage, 0), 100);
  const filledTicks = Math.round((progress / 100) * TICK_COUNT);

  const ticks = Array.from({length: TICK_COUNT}, (_, i) => {
    const angle = (i * 360) / TICK_COUNT - 90; // 12시 방향부터 시작
    const rad = (angle * Math.PI) / 180;
    const isMajor = i % 5 === 0; // 매 5번째 눈금은 길게
    const len = isMajor ? majorTickLength : tickLength;
    const r1 = outerRadius;
    const r2 = outerRadius - len;
    const isFilled = i < filledTicks;
    const tickWidth = isMajor ? 3 : 2;

    return {
      x1: center + r1 * Math.cos(rad),
      y1: center + r1 * Math.sin(rad),
      x2: center + r2 * Math.cos(rad),
      y2: center + r2 * Math.sin(rad),
      isFilled,
      isMajor,
      tickWidth,
    };
  });

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {/* 내부 원 (은은한 배경) */}
        <SvgCircle
          cx={center}
          cy={center}
          r={innerRadius - 8}
          fill={COLORS.surface}
          opacity={0.6}
        />

        {/* 눈금들 */}
        {ticks.map((tick, i) => (
          <Line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isFilled ? info.color : COLORS.gaugeTick}
            strokeWidth={tick.tickWidth}
            strokeLinecap="round"
            opacity={tick.isFilled ? 1 : 0.4}
          />
        ))}
      </Svg>

      {/* 중앙 정보 */}
      <View style={styles.centerContent}>
        <Text style={styles.label}>피로도</Text>
        <Text style={[styles.percentage, {color: info.color}]}>
          {Math.round(percentage)}
          <Text style={[styles.percentSign, {color: info.color}]}>%</Text>
        </Text>
        <Text style={[styles.levelName, {color: info.color}]}>
          {info.displayName}
        </Text>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  percentage: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  percentSign: {
    fontSize: 22,
    fontWeight: '600',
  },
  levelName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: -2,
  },
});

export default FatigueCircle;
