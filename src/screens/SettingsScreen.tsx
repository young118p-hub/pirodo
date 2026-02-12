/**
 * 설정 화면 - 입력 모드 선택 및 옵션 설정
 * V4 트렌디 UI
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
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const THEME_OPTIONS = [
  {value: 'system' as const, label: '시스템 설정', emoji: '📱'},
  {value: 'light' as const, label: '라이트', emoji: '☀️'},
  {value: 'dark' as const, label: '다크', emoji: '🌙'},
];

const SettingsScreen: React.FC = () => {
  const {settings, updateSettings, setInputMode} = useSettings();
  const {themeMode, setThemeMode, colors} = useTheme();
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

  const renderModeCard = (mode: InputMode) => {
    const info = INPUT_MODE_INFO[mode];
    const isSelected = settings.inputMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        style={[styles.modeCard, isSelected && styles.modeCardSelected]}
        onPress={() => setInputMode(mode)}
        activeOpacity={0.7}>
        {/* 좌측 컬러 바 */}
        {isSelected && <View style={styles.modeColorBar} />}

        <View style={styles.modeBody}>
          <View style={styles.modeHeader}>
            <Text style={styles.modeEmoji}>{info.emoji}</Text>
            <View style={styles.modeHeaderText}>
              <Text style={[styles.modeName, isSelected && styles.modeNameSelected]}>
                {info.displayName}
              </Text>
              {isSelected && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>사용 중</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.modeDescription}>{info.description}</Text>
          <View style={styles.dataSourcesContainer}>
            {info.dataSources.map((source, index) => (
              <View key={index} style={styles.dataSourceBadge}>
                <Text style={styles.dataSourceText}>{source}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>측정 방식</Text>
      <Text style={styles.sectionSubtitle}>
        피로도를 어떻게 측정할지 선택하세요
      </Text>

      {[InputMode.WATCH, InputMode.PHONE, InputMode.MANUAL].map(renderModeCard)}

      {/* 테마 설정 */}
      <Text style={[styles.sectionTitle, {marginTop: 32}]}>화면 테마</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.themeOption,
              themeMode === opt.value && styles.themeOptionSelected,
            ]}
            onPress={() => setThemeMode(opt.value)}
            activeOpacity={0.7}>
            <Text style={styles.themeEmoji}>{opt.emoji}</Text>
            <Text style={[
              styles.themeLabel,
              themeMode === opt.value && styles.themeLabelSelected,
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {settings.inputMode !== InputMode.MANUAL && (
        <>
          <Text style={[styles.sectionTitle, {marginTop: 32}]}>자동 감지 설정</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>앉아있기 감지</Text>
                <Text style={styles.settingDescription}>
                  {settings.sedentaryThresholdMinutes}분 이상 움직임 없으면 자동 기록
                </Text>
              </View>
              <Switch
                value={settings.enableSedentaryDetection}
                onValueChange={(value) =>
                  updateSettings({enableSedentaryDetection: value})
                }
                trackColor={{false: COLORS.gaugeBackground, true: COLORS.accentLight}}
                thumbColor={settings.enableSedentaryDetection ? COLORS.accent : COLORS.textTertiary}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>알림</Text>
                <Text style={styles.settingDescription}>
                  피로도 높을 때 휴식 알림
                </Text>
              </View>
              <Switch
                value={settings.enableNotifications}
                onValueChange={(value) =>
                  updateSettings({enableNotifications: value})
                }
                trackColor={{false: COLORS.gaugeBackground, true: COLORS.accentLight}}
                thumbColor={settings.enableNotifications ? COLORS.accent : COLORS.textTertiary}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>감지 시간대</Text>
                <Text style={styles.settingDescription}>
                  {settings.daytimeStartHour}시 ~ {settings.daytimeEndHour}시 사이에만 감지
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* 데이터 관리 섹션 */}
      <Text style={[styles.sectionTitle, {marginTop: 32}]}>데이터 관리</Text>
      <Text style={styles.sectionSubtitle}>
        {dataSummary.historyDays}일치 기록 보관 중
      </Text>

      <View style={styles.settingCard}>
        <TouchableOpacity style={styles.settingRow} onPress={handleExport} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📤 백업 내보내기</Text>
            <Text style={styles.settingDescription}>JSON 파일로 데이터 공유</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingDivider} />

        <TouchableOpacity style={styles.settingRow} onPress={() => setImportModalVisible(true)} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📥 백업 복원</Text>
            <Text style={styles.settingDescription}>JSON 데이터로 복원</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingDivider} />

        <TouchableOpacity style={styles.settingRow} onPress={handleReset} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: COLORS.fatigue.exhausted}]}>🗑️ 데이터 초기화</Text>
            <Text style={styles.settingDescription}>모든 기록 삭제</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 복원 모달 */}
      <Modal visible={importModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>백업 복원</Text>
            <Text style={styles.modalSubtitle}>백업 JSON 데이터를 붙여넣으세요</Text>
            <TextInput
              style={styles.importInput}
              multiline
              placeholder='{"version":1,"appName":"pirodo",...}'
              placeholderTextColor={COLORS.textTertiary}
              value={importText}
              onChangeText={setImportText}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {setImportModalVisible(false); setImportText('');}}
                activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleImport}
                activeOpacity={0.7}>
                <Text style={styles.modalConfirmText}>복원</Text>
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 22,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: 16,
  },

  // 모드 카드
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    ...SHADOWS.card,
  },
  modeCardSelected: {
    backgroundColor: COLORS.accentLight,
  },
  modeColorBar: {
    width: 4,
    backgroundColor: COLORS.accent,
  },
  modeBody: {
    flex: 1,
    padding: SPACING.cardPadding,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  modeHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeName: {
    ...TYPOGRAPHY.heading,
  },
  modeNameSelected: {
    color: COLORS.accent,
  },
  activeBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  modeDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  dataSourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dataSourceBadge: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dataSourceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
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
  themeLabelSelected: {
    color: COLORS.accent,
  },

  // 설정 카드 (통합)
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

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    marginBottom: 14,
  },
  importInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.small,
    padding: 12,
    minHeight: 150,
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SettingsScreen;
