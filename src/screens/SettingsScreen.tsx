/**
 * 설정 화면 - 입력 모드 선택 및 옵션 설정
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
} from 'react-native';
import {InputMode} from '../types';
import {INPUT_MODE_INFO} from '../utils/constants';
import {useSettings} from '../contexts/SettingsContext';
import {COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY} from '../utils/theme';

const SettingsScreen: React.FC = () => {
  const {settings, updateSettings, setInputMode} = useSettings();

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
});

export default SettingsScreen;
