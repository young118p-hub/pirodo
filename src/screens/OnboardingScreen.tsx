/**
 * 온보딩 화면 - 첫 실행 시 앱 소개
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Pirodo',
    subtitle: '스마트 피로도 트래커',
    description: '당신의 피로를 측정하고\n최적의 회복 방법을 알려드려요',
    emoji: '🔋',
  },
  {
    title: '준비 완료!',
    subtitle: '이제 시작해볼까요?',
    description: '워치와 폰의 건강 데이터를 자동으로 수집하고\n매일 사용할수록 더 정확해져요',
    emoji: '🚀',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onComplete}) => {
  const {colors} = useTheme();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step >= steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const currentStep = steps[step];

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* 진행 표시 */}
      <View style={styles.progressRow}>
        {steps.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              {backgroundColor: colors.gaugeBackground},
              idx <= step && [styles.progressDotActive, {backgroundColor: colors.accent}],
            ]}
          />
        ))}
      </View>

      <View style={styles.contentArea}>
        <Text style={styles.emoji}>{currentStep.emoji}</Text>
        <Text style={[styles.title, {color: colors.textPrimary}]}>{currentStep.title}</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>{currentStep.subtitle}</Text>
        <Text style={[styles.description, {color: colors.textTertiary}]}>{currentStep.description}</Text>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.nextButton, {backgroundColor: colors.accent}]}
          onPress={handleNext}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {step >= steps.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
        {step === 0 && (
          <TouchableOpacity onPress={onComplete} activeOpacity={0.6}>
            <Text style={[styles.skipText, {color: colors.textTertiary}]}>건너뛰기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 80,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gaugeBackground,
  },
  progressDotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomArea: {
    alignItems: 'center',
    gap: 16,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.small,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});

export default OnboardingScreen;
