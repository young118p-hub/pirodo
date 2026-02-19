/**
 * 설정 화면
 * V4 트렌디 UI
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {InputMode} from '../types';
import {useSettings} from '../contexts/SettingsContext';
import {useTheme} from '../contexts/ThemeContext';
import {BackupService} from '../services/BackupService';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const THEME_OPTIONS = [
  {value: 'system' as const, label: '시스템 설정', emoji: '📱'},
  {value: 'light' as const, label: '라이트', emoji: '☀️'},
  {value: 'dark' as const, label: '다크', emoji: '🌙'},
];

const SettingsScreen: React.FC = () => {
  const {settings, updateSettings, setInputMode} = useSettings();
  const {themeMode, setThemeMode, colors, shadows} = useTheme();

  const handleReset = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 피로도 데이터가 삭제됩니다. 되돌릴 수 없습니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await BackupService.clearAllData();
            Alert.alert('완료', '모든 데이터가 초기화되었습니다. 앱을 재시작하세요.');
          },
        },
      ],
    );
  };

  const isAuto = settings.inputMode === InputMode.AUTO;

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* 측정 방식 토글 */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>측정 방식</Text>
      <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>자동 측정</Text>
            <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
              {isAuto
                ? '워치 + 폰 건강 데이터를 자동 수집합니다'
                : '슬라이더로 직접 컨디션을 입력합니다'}
            </Text>
          </View>
          <Switch
            value={isAuto}
            onValueChange={(value) =>
              setInputMode(value ? InputMode.AUTO : InputMode.MANUAL)
            }
            trackColor={{false: colors.gaugeBackground, true: colors.accentLight}}
            thumbColor={isAuto ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>

      {/* 테마 설정 */}
      <Text style={[styles.sectionTitle, {marginTop: 32, color: colors.textPrimary}]}>화면 테마</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.themeOption,
              {backgroundColor: colors.surface},
              shadows.subtle,
              themeMode === opt.value && [styles.themeOptionSelected, {borderColor: colors.accent, backgroundColor: colors.accentLight}],
            ]}
            onPress={() => setThemeMode(opt.value)}
            activeOpacity={0.7}>
            <Text style={styles.themeEmoji}>{opt.emoji}</Text>
            <Text style={[
              styles.themeLabel,
              {color: colors.textSecondary},
              themeMode === opt.value && {color: colors.accent},
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 자동 감지 설정 (AUTO 모드일 때만) */}
      {isAuto && (
        <>
          <Text style={[styles.sectionTitle, {marginTop: 32, color: colors.textPrimary}]}>자동 감지 설정</Text>

          <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>앉아있기 감지</Text>
                <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
                  {settings.sedentaryThresholdMinutes}분 이상 움직임 없으면 자동 기록
                </Text>
              </View>
              <Switch
                value={settings.enableSedentaryDetection}
                onValueChange={(value) =>
                  updateSettings({enableSedentaryDetection: value})
                }
                trackColor={{false: colors.gaugeBackground, true: colors.accentLight}}
                thumbColor={settings.enableSedentaryDetection ? colors.accent : colors.textTertiary}
              />
            </View>

            <View style={[styles.settingDivider, {backgroundColor: colors.divider}]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>알림</Text>
                <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
                  피로도 높을 때 휴식 알림
                </Text>
              </View>
              <Switch
                value={settings.enableNotifications}
                onValueChange={(value) =>
                  updateSettings({enableNotifications: value})
                }
                trackColor={{false: colors.gaugeBackground, true: colors.accentLight}}
                thumbColor={settings.enableNotifications ? colors.accent : colors.textTertiary}
              />
            </View>

            <View style={[styles.settingDivider, {backgroundColor: colors.divider}]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>감지 시간대</Text>
                <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
                  {settings.daytimeStartHour}시 ~ {settings.daytimeEndHour}시 사이에만 감지
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* 데이터 관리 섹션 */}
      <Text style={[styles.sectionTitle, {marginTop: 32, color: colors.textPrimary}]}>데이터 관리</Text>

      <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
        <TouchableOpacity style={styles.settingRow} onPress={handleReset} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.fatigue.exhausted}]}>🗑️ 데이터 초기화</Text>
            <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>모든 기록 삭제</Text>
          </View>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 22,
    marginBottom: 12,
  },

  // 테마 선택
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.subtle,
  },
  themeOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // 설정 카드
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 4,
    ...SHADOWS.card,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});

export default SettingsScreen;
