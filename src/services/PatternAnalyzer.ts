/**
 * PatternAnalyzer - AI 패턴 분석
 * 히스토리 데이터 기반으로 피로도 패턴을 분석하고 인사이트 제공
 * 외부 API 없이 로컬 규칙 기반 분석
 */

import {DailyHistoryRecord} from '../types';

export interface PatternInsight {
  emoji: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
}

export interface WeeklyAnalysis {
  trend: 'improving' | 'worsening' | 'stable';
  trendDescription: string;
  insights: PatternInsight[];
  worstDayOfWeek: string;
  bestDayOfWeek: string;
  avgFatigue: number;
  sleepFatigueCorrelation: 'strong' | 'moderate' | 'weak' | 'insufficient';
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export class PatternAnalyzer {
  /**
   * 주간 패턴 분석
   */
  static analyzeWeekly(records: DailyHistoryRecord[]): WeeklyAnalysis {
    if (records.length < 3) {
      return {
        trend: 'stable',
        trendDescription: '데이터가 충분하지 않아요. 3일 이상 기록하면 분석이 시작됩니다.',
        insights: [],
        worstDayOfWeek: '-',
        bestDayOfWeek: '-',
        avgFatigue: 0,
        sleepFatigueCorrelation: 'insufficient',
      };
    }

    const insights: PatternInsight[] = [];

    // 피로도 트렌드 계산
    const halfPoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, halfPoint);
    const secondHalf = records.slice(halfPoint);
    const firstAvg = avg(firstHalf.map(r => r.fatiguePercentage));
    const secondAvg = avg(secondHalf.map(r => r.fatiguePercentage));
    const diff = secondAvg - firstAvg;

    let trend: 'improving' | 'worsening' | 'stable';
    let trendDescription: string;

    if (diff < -5) {
      trend = 'improving';
      trendDescription = `피로도가 ${Math.abs(Math.round(diff))}% 개선되고 있어요! 잘 하고 있습니다.`;
    } else if (diff > 5) {
      trend = 'worsening';
      trendDescription = `피로도가 ${Math.round(diff)}% 증가하는 추세에요. 휴식이 필요합니다.`;
    } else {
      trend = 'stable';
      trendDescription = '피로도가 안정적으로 유지되고 있어요.';
    }

    // 요일별 평균 피로도
    const dayFatigues: Record<number, number[]> = {};
    for (const r of records) {
      const [y, m, d] = r.date.split('-').map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      if (!dayFatigues[dayOfWeek]) dayFatigues[dayOfWeek] = [];
      dayFatigues[dayOfWeek].push(r.fatiguePercentage);
    }

    let worstDay = 0;
    let bestDay = 0;
    let worstAvg = 0;
    let bestAvg = 100;

    for (const [day, fatigues] of Object.entries(dayFatigues)) {
      const dayAvg = avg(fatigues);
      if (dayAvg > worstAvg) {
        worstAvg = dayAvg;
        worstDay = Number(day);
      }
      if (dayAvg < bestAvg) {
        bestAvg = dayAvg;
        bestDay = Number(day);
      }
    }

    // 수면-피로도 상관관계
    const sleepData = records.filter(r => r.sleepHours > 0);
    let correlation: 'strong' | 'moderate' | 'weak' | 'insufficient' = 'insufficient';

    if (sleepData.length >= 5) {
      const sleepFatigueR = calculateCorrelation(
        sleepData.map(r => r.sleepHours),
        sleepData.map(r => r.fatiguePercentage),
      );
      if (Math.abs(sleepFatigueR) > 0.6) correlation = 'strong';
      else if (Math.abs(sleepFatigueR) > 0.3) correlation = 'moderate';
      else correlation = 'weak';
    }

    // 인사이트 생성
    const avgFatigue = Math.round(avg(records.map(r => r.fatiguePercentage)));

    // 1. 주중 vs 주말 패턴
    const weekdayRecords = records.filter(r => {
      const [ry, rm, rd] = r.date.split('-').map(Number);
      const day = new Date(ry, rm - 1, rd).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendRecords = records.filter(r => {
      const [ry, rm, rd] = r.date.split('-').map(Number);
      const day = new Date(ry, rm - 1, rd).getDay();
      return day === 0 || day === 6;
    });

    if (weekdayRecords.length >= 2 && weekendRecords.length >= 1) {
      const weekdayAvg = avg(weekdayRecords.map(r => r.fatiguePercentage));
      const weekendAvg = avg(weekendRecords.map(r => r.fatiguePercentage));

      if (weekdayAvg - weekendAvg > 10) {
        insights.push({
          emoji: '📅',
          title: '주중 피로도 높음',
          description: `주중(${Math.round(weekdayAvg)}%)이 주말(${Math.round(weekendAvg)}%)보다 ${Math.round(weekdayAvg - weekendAvg)}% 높아요. 주중에 더 많은 휴식을 챙기세요.`,
          type: 'warning',
        });
      }
    }

    // 2. 수면 패턴
    if (sleepData.length >= 3) {
      const avgSleep = avg(sleepData.map(r => r.sleepHours));
      if (avgSleep < 6) {
        insights.push({
          emoji: '😴',
          title: '수면 부족 패턴',
          description: `평균 수면 ${avgSleep.toFixed(1)}시간. 7시간 이상 자면 피로도가 크게 개선될 수 있어요.`,
          type: 'warning',
        });
      } else if (avgSleep >= 7) {
        insights.push({
          emoji: '🌙',
          title: '수면 습관 양호',
          description: `평균 ${avgSleep.toFixed(1)}시간 수면. 좋은 습관을 유지하고 있어요!`,
          type: 'positive',
        });
      }
    }

    // 3. 걸음수 패턴
    const stepsData = records.filter(r => r.stepCount > 0);
    if (stepsData.length >= 3) {
      const avgSteps = avg(stepsData.map(r => r.stepCount));
      if (avgSteps < 4000) {
        insights.push({
          emoji: '👟',
          title: '활동량 부족',
          description: `평균 ${Math.round(avgSteps).toLocaleString()}걸음. 목표 8,000걸음의 절반 이하에요.`,
          type: 'warning',
        });
      } else if (avgSteps >= 8000) {
        insights.push({
          emoji: '🏃',
          title: '활발한 활동량',
          description: `평균 ${Math.round(avgSteps).toLocaleString()}걸음! 꾸준한 운동이 피로 회복에 도움이 되고 있어요.`,
          type: 'positive',
        });
      }
    }

    // 4. 연속 고피로 감지
    let consecutiveHigh = 0;
    let maxConsecutiveHigh = 0;
    for (const r of records) {
      if (r.fatiguePercentage >= 70) {
        consecutiveHigh++;
        maxConsecutiveHigh = Math.max(maxConsecutiveHigh, consecutiveHigh);
      } else {
        consecutiveHigh = 0;
      }
    }

    if (maxConsecutiveHigh >= 3) {
      insights.push({
        emoji: '🚨',
        title: '연속 고피로 주의',
        description: `${maxConsecutiveHigh}일 연속 피로도 70% 이상이었어요. 충분한 휴식이 시급합니다.`,
        type: 'warning',
      });
    }

    // 5. 수면-피로 상관관계 인사이트
    if (correlation === 'strong') {
      insights.push({
        emoji: '🔗',
        title: '수면이 핵심 요인',
        description: '수면 시간이 피로도에 강한 영향을 주고 있어요. 수면 관리에 집중하세요.',
        type: 'neutral',
      });
    }

    return {
      trend,
      trendDescription,
      insights: insights.slice(0, 4), // 최대 4개
      worstDayOfWeek: `${DAY_NAMES[worstDay]}요일`,
      bestDayOfWeek: `${DAY_NAMES[bestDay]}요일`,
      avgFatigue,
      sleepFatigueCorrelation: correlation,
    };
  }
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;

  const xMean = avg(x);
  const yMean = avg(y);

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }

  const denominator = Math.sqrt(xDenominator * yDenominator);
  if (denominator === 0) return 0;
  return numerator / denominator;
}
