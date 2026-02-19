/**
 * 활동 추가 화면
 * V4 트렌디 UI
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useFatigue} from '../contexts/FatigueContext';
import {ActivityType, InputMode} from '../types';
import {ACTIVITY_TYPE_INFO, INPUT_MODE_INFO} from '../utils/constants';
import {useTheme} from '../contexts/ThemeContext';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

interface AddActivityScreenProps {
  navigation: any;
}

const AddActivityScreen: React.FC<AddActivityScreenProps> = ({navigation}) => {
  const {colors, shadows} = useTheme();
  const {addActivity, inputMode} = useFatigue();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!selectedType) {
      Alert.alert('알림', '활동 유형을 선택해주세요.');
      return;
    }

    const hoursNum = parseInt(hours || '0');
    const minutesNum = parseInt(minutes || '0');

    if (isNaN(hoursNum) || isNaN(minutesNum)) {
      Alert.alert('알림', '올바른 숫자를 입력해주세요.');
      return;
    }

    if (hoursNum < 0 || minutesNum < 0) {
      Alert.alert('알림', '시간은 0 이상이어야 합니다.');
      return;
    }

    if (hoursNum > 24) {
      Alert.alert('알림', '하루는 24시간입니다. 24시간 이하로 입력해주세요.');
      return;
    }

    if (minutesNum >= 60) {
      Alert.alert('알림', '분은 0-59 사이로 입력해주세요.');
      return;
    }

    const totalMinutes = hoursNum * 60 + minutesNum;

    if (totalMinutes <= 0) {
      Alert.alert('알림', '시간을 입력해주세요.');
      return;
    }

    if (totalMinutes > 1440) {
      Alert.alert('알림', '하루는 24시간(1440분)입니다.');
      return;
    }

    addActivity(selectedType, totalMinutes, note || undefined);
    Alert.alert('완료', '활동이 추가되었습니다.', [
      {text: '확인', onPress: () => navigation.goBack()},
    ]);
  };

  const fatigueActivities = Object.values(ACTIVITY_TYPE_INFO).filter(
    info => !info.isRecovery,
  );
  const recoveryActivities = Object.values(ACTIVITY_TYPE_INFO).filter(
    info => info.isRecovery,
  );

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* 자동 추적 배너 */}
        {inputMode !== InputMode.MANUAL && (
          <View style={[styles.autoBanner, {backgroundColor: colors.accentLight}]}>
            <Text style={styles.autoBannerEmoji}>
              {INPUT_MODE_INFO[inputMode].emoji}
            </Text>
            <View style={styles.autoBannerContent}>
              <Text style={[styles.autoBannerTitle, {color: colors.accent}]}>
                {INPUT_MODE_INFO[inputMode].displayName} 모드 활성
              </Text>
              <Text style={[styles.autoBannerDesc, {color: colors.textSecondary}]}>
                걸음수, 수면 등이 자동 기록됩니다. 여기서는 보충 활동만 추가하세요.
              </Text>
            </View>
          </View>
        )}

        {/* 피로 증가 활동 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>피로 증가 활동</Text>
          <View style={styles.grid}>
            {fatigueActivities.map(info => (
              <TouchableOpacity
                key={info.type}
                style={[
                  styles.activityCard,
                  {backgroundColor: colors.surface},
                  shadows.subtle,
                  selectedType === info.type && [styles.activityCardSelected, {borderColor: colors.fatigue.tired, backgroundColor: colors.fatigue.tired + '18'}],
                ]}
                onPress={() => setSelectedType(info.type)}
                activeOpacity={0.7}>
                <Text style={styles.activityEmoji}>{info.emoji}</Text>
                <Text style={[styles.activityName, {color: colors.textPrimary}]}>{info.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 회복 활동 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>회복 활동</Text>
          <View style={styles.grid}>
            {recoveryActivities.map(info => (
              <TouchableOpacity
                key={info.type}
                style={[
                  styles.activityCard,
                  {backgroundColor: colors.metricBg.sleep},
                  shadows.subtle,
                  selectedType === info.type && [styles.activityCardSelectedRecovery, {borderColor: colors.fatigue.excellent, backgroundColor: colors.fatigue.excellent + '18'}],
                ]}
                onPress={() => setSelectedType(info.type)}
                activeOpacity={0.7}>
                <Text style={styles.activityEmoji}>{info.emoji}</Text>
                <Text style={[styles.activityName, {color: colors.textPrimary}]}>{info.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 시간 입력 */}
        {selectedType && (
          <View style={styles.timeSection}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>시간 입력</Text>
            <View style={styles.presetRow}>
              {[
                {label: '5분', h: '0', m: '5'},
                {label: '15분', h: '0', m: '15'},
                {label: '30분', h: '0', m: '30'},
                {label: '1시간', h: '1', m: '0'},
              ].map(preset => {
                const isActive = hours === preset.h && minutes === preset.m;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.presetButton,
                      {backgroundColor: colors.surface},
                      isActive && {backgroundColor: colors.accentLight, borderColor: colors.accent},
                    ]}
                    onPress={() => { setHours(preset.h); setMinutes(preset.m); }}
                    activeOpacity={0.7}>
                    <Text style={[styles.presetText, {color: colors.textSecondary}, isActive && {color: colors.accent, fontWeight: '700'}]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.timeInputContainer, {backgroundColor: colors.surface}, shadows.card]}>
              <View style={styles.timeInput}>
                <TextInput
                  style={[styles.timeTextInput, {color: colors.accent}]}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.timeLabel, {color: colors.textSecondary}]}>시간</Text>
              </View>
              <Text style={[styles.timeSeparator, {color: colors.accent}]}>:</Text>
              <View style={styles.timeInput}>
                <TextInput
                  style={[styles.timeTextInput, {color: colors.accent}]}
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.timeLabel, {color: colors.textSecondary}]}>분</Text>
              </View>
            </View>
          </View>
        )}

        {/* 메모 */}
        {selectedType && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>메모 (선택사항)</Text>
            <TextInput
              style={[styles.noteInput, {backgroundColor: colors.surface, color: colors.textPrimary}, shadows.subtle]}
              value={note}
              onChangeText={setNote}
              placeholder="메모를 입력하세요..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* 추가 버튼 */}
        {selectedType && (
          <TouchableOpacity
            style={[styles.addButton, {backgroundColor: colors.accent}]}
            onPress={handleAdd}
            activeOpacity={0.7}>
            <Text style={styles.addButtonText}>활동 추가</Text>
          </TouchableOpacity>
        )}
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
  },
  autoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.small,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  autoBannerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  autoBannerContent: {
    flex: 1,
  },
  autoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 2,
  },
  autoBannerDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.subtle,
  },
  recoveryCard: {
    backgroundColor: COLORS.metricBg.sleep,
  },
  activityCardSelected: {},
  activityCardSelectedRecovery: {},
  activityEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  activityName: {
    ...TYPOGRAPHY.small,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  timeSection: {
    marginBottom: 28,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 20,
    ...SHADOWS.card,
  },
  timeInput: {
    alignItems: 'center',
  },
  timeTextInput: {
    fontSize: 48,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'center',
    color: COLORS.accent,
  },
  timeLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: 5,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginHorizontal: 10,
  },
  noteInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: COLORS.textPrimary,
    ...SHADOWS.subtle,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.card,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddActivityScreen;
