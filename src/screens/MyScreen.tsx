/**
 * 설정 화면
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {InputMode} from '../types';
import {INPUT_MODE_INFO} from '../utils/constants';
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

  const [dataSummary, setDataSummary] = useState({totalKeys: 0, historyDays: 0, settingsExist: false});
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    BackupService.getDataSummary().then(setDataSummary);
  }, []);

  const handleExport = async () => {
    const success = await BackupService.shareBackup();
    if (!success) {
      Alert.alert('오류', '백업 내보내기에 실패했습니다.');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      Alert.alert('오류', 'JSON 데이터를 입력해주세요.');
      return;
    }
    const result = await BackupService.importData(importText);
    setImportModalVisible(false);
    setImportText('');
    Alert.alert(result.success ? '복원 완료' : '오류', result.message);
    if (result.success) {
      BackupService.getDataSummary().then(setDataSummary);
    }
  };

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

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <Text style={[styles.pageTitle, {color: colors.textPrimary}]}>설정</Text>

      {/* 측정 방식 */}
      <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>측정 방식</Text>
      {[InputMode.WATCH, InputMode.PHONE, InputMode.MANUAL].map(mode => {
        const info = INPUT_MODE_INFO[mode];
        const isSelected = settings.inputMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeCard,
              {backgroundColor: colors.surface},
              shadows.card,
              isSelected && {backgroundColor: colors.accentLight},
            ]}
            onPress={() => setInputMode(mode)}
            activeOpacity={0.7}>
            {isSelected && <View style={[styles.modeColorBar, {backgroundColor: colors.accent}]} />}
            <View style={styles.modeBody}>
              <Text style={styles.modeEmoji}>{info.emoji}</Text>
              <View style={styles.modeText}>
                <Text style={[styles.modeName, {color: isSelected ? colors.accent : colors.textPrimary}]}>
                  {info.displayName}
                </Text>
                <Text style={[styles.modeDesc, {color: colors.textSecondary}]} numberOfLines={1}>
                  {info.description}
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.activeBadge, {backgroundColor: colors.accent}]}>
                  <Text style={styles.activeBadgeText}>사용 중</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

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
      {settings.inputMode !== InputMode.MANUAL && (
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
      <Text style={[styles.sectionSub, {color: colors.textSecondary}]}>
        {dataSummary.historyDays}일치 기록 보관 중
      </Text>

      <View style={[styles.settingCard, {backgroundColor: colors.surface}, shadows.card]}>
        <TouchableOpacity style={styles.settingRow} onPress={handleExport} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>📤 백업 내보내기</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.settingDivider, {backgroundColor: colors.divider}]} />
        <TouchableOpacity style={styles.settingRow} onPress={() => setImportModalVisible(true)} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>📥 백업 복원</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.settingDivider, {backgroundColor: colors.divider}]} />
        <TouchableOpacity style={styles.settingRow} onPress={handleReset} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.fatigue.exhausted}]}>🗑️ 데이터 초기화</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 복원 모달 */}
      <Modal visible={importModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <Text style={[styles.modalTitle, {color: colors.textPrimary}]}>백업 복원</Text>
            <TextInput
              style={[styles.importInput, {backgroundColor: colors.background, color: colors.textPrimary}]}
              multiline
              placeholder='{"version":1,"appName":"pirodo",...}'
              placeholderTextColor={colors.textTertiary}
              value={importText}
              onChangeText={setImportText}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.background}]}
                onPress={() => {setImportModalVisible(false); setImportText('');}}
                activeOpacity={0.7}>
                <Text style={[styles.modalBtnText, {color: colors.textSecondary}]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.accent}]}
                onPress={handleImport}
                activeOpacity={0.7}>
                <Text style={[styles.modalBtnText, {color: '#FFF'}]}>복원</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionSub: {
    ...TYPOGRAPHY.caption,
    marginBottom: 12,
    marginTop: -8,
  },

  // 모드 카드
  modeCard: {
    borderRadius: RADIUS.card,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  modeColorBar: {
    width: 4,
  },
  modeBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  modeEmoji: {
    fontSize: 24,
  },
  modeText: {
    flex: 1,
  },
  modeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  modeDesc: {
    ...TYPOGRAPHY.caption,
    marginTop: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
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

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading,
    marginBottom: 12,
  },
  importInput: {
    borderRadius: RADIUS.small,
    padding: 12,
    minHeight: 120,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyScreen;
