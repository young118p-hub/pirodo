/**
 * 설정 화면
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
  NativeModules,
} from 'react-native';
import {InputMode} from '../types';
import {useSettings} from '../contexts/SettingsContext';
import {useTheme} from '../contexts/ThemeContext';
import {BackupService} from '../services/BackupService';
import {COLORS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const THEME_OPTIONS = [
  {value: 'system' as const, label: '시스템', emoji: '📱'},
  {value: 'light' as const, label: '라이트', emoji: '☀️'},
  {value: 'dark' as const, label: '다크', emoji: '🌙'},
];

const MyScreen: React.FC = () => {
  const {settings, updateSettings, setInputMode} = useSettings();
  const {themeMode, setThemeMode, colors, shadows} = useTheme();

  const isAuto = settings.inputMode === InputMode.AUTO;

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
            // 앱 자동 재시작으로 메모리 상태도 초기화
            NativeModules.DevSettings?.reload?.();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <Text style={[styles.pageTitle, {color: colors.textPrimary}]}>설정</Text>

      {/* 측정 방식 */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>측정 방식</Text>
      <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>자동 측정</Text>
            <Text style={[styles.settingDesc, {color: colors.textSecondary}]}>
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
            trackColor={{false: colors.divider, true: colors.accentLight}}
            thumbColor={isAuto ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>

      {/* 테마 */}
      <Text style={[styles.sectionTitle, {marginTop: 24, color: colors.textPrimary}]}>화면 테마</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.themeOption,
              {backgroundColor: colors.surface},
              shadows.subtle,
              themeMode === opt.value && {borderColor: colors.accent, backgroundColor: colors.accentLight},
            ]}
            onPress={() => setThemeMode(opt.value)}
            activeOpacity={0.7}>
            <Text style={styles.themeEmoji}>{opt.emoji}</Text>
            <Text style={[
              styles.themeLabel,
              {color: themeMode === opt.value ? colors.accent : colors.textSecondary},
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 자동 감지 설정 */}
      {isAuto && (
        <>
          <Text style={[styles.sectionTitle, {marginTop: 24, color: colors.textPrimary}]}>자동 감지</Text>
          <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>앉아있기 감지</Text>
                <Text style={[styles.settingDesc, {color: colors.textSecondary}]}>
                  {settings.sedentaryThresholdMinutes}분 이상 → 자동 기록
                </Text>
              </View>
              <Switch
                value={settings.enableSedentaryDetection}
                onValueChange={v => updateSettings({enableSedentaryDetection: v})}
                trackColor={{false: colors.divider, true: colors.accentLight}}
                thumbColor={settings.enableSedentaryDetection ? colors.accent : colors.textTertiary}
              />
            </View>
            <View style={[styles.settingDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>알림</Text>
                <Text style={[styles.settingDesc, {color: colors.textSecondary}]}>
                  피로도 높을 때 휴식 알림
                </Text>
              </View>
              <Switch
                value={settings.enableNotifications}
                onValueChange={v => updateSettings({enableNotifications: v})}
                trackColor={{false: colors.divider, true: colors.accentLight}}
                thumbColor={settings.enableNotifications ? colors.accent : colors.textTertiary}
              />
            </View>
          </View>
        </>
      )}

      {/* 데이터 관리 */}
      <Text style={[styles.sectionTitle, {marginTop: 24, color: colors.textPrimary}]}>데이터 관리</Text>
      <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
        <TouchableOpacity style={styles.settingRow} onPress={handleReset} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.fatigue.exhausted}]}>🗑️ 데이터 초기화</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  pageTitle: {
    ...TYPOGRAPHY.title,
    marginBottom: 20,
  },

  // 섹션
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  // 테마
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    borderRadius: RADIUS.card,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // 설정 카드
  settingCard: {
    borderRadius: RADIUS.card,
    padding: 4,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDesc: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});

export default MyScreen;
