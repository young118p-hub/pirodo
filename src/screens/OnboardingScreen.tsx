/**
 * 온보딩 화면 - 첫 실행 시 입력 모드 선택 가이드
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {InputMode} from '../types';
import {INPUT_MODE_INFO} from '../utils/constants';
import {useSettings} from '../contexts/SettingsContext';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const {width} = Dimensions.get('window');

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
    title: '측정 방식 선택',
    subtitle: '나에게 맞는 방법을 골라주세요',
    description: '',
    emoji: '',
    isSelection: true,
  },
  {
    title: '준비 완료!',
    subtitle: '이제 시작해볼까요?',
    description: '매일 사용할수록\n더 정확한 피로도를 알려드려요',
    emoji: '🚀',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onComplete}) => {
  const {setInputMode} = useSettings();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<InputMode>(InputMode.MANUAL);

  const handleNext = () => {
    if (step === 1) {
      setInputMode(selectedMode);
    }
    if (step >= steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const currentStep = steps[step];

  return (
    <View style={styles.container}>
      {/* 진행 표시 */}
      <View style={styles.progressRow}>
        {steps.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              idx <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.contentArea}>
        {!currentStep.isSelection ? (
          <>
            <Text style={styles.emoji}>{currentStep.emoji}</Text>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
            <Text style={styles.description}>{currentStep.description}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

            <View style={styles.modeList}>
              {([InputMode.WATCH, InputMode.PHONE, InputMode.MANUAL] as InputMode[]).map(
                mode => {
                  const info = INPUT_MODE_INFO[mode];
                  const isSelected = selectedMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                      onPress={() => setSelectedMode(mode)}
                      activeOpacity={0.7}>
                      <Text style={styles.modeEmoji}>{info.emoji}</Text>
                      <View style={styles.modeInfo}>
                        <Text style={[styles.modeName, isSelected && styles.modeNameSelected]}>
                          {info.displayName}
                        </Text>
                        <Text style={styles.modeDesc}>{info.description}</Text>
                        <View style={styles.modeSourcesRow}>
                          {info.dataSources.map((src, idx) => (
                            <View key={idx} style={styles.sourceChip}>
                              <Text style={styles.sourceChipText}>{src}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {step >= steps.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
        {step === 0 && (
          <TouchableOpacity onPress={onComplete} activeOpacity={0.6}>
            <Text style={styles.skipText}>건너뛰기</Text>
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

  // 모드 선택
  modeList: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  modeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.card,
  },
  modeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  modeEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  modeNameSelected: {
    color: COLORS.accent,
  },
  modeDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  modeSourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sourceChip: {
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sourceChipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // 하단
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
