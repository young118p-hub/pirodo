/**
 * 설정 화면 - 입력 모드 선택 및 옵션 설정
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
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>측정 방식</Text>
      <Text style={styles.sectionSubtitle}>
        피로도를 어떻게 측정할지 선택하세요
      </Text>

      {[InputMode.WATCH, InputMode.PHONE, InputMode.MANUAL].map(renderModeCard)}

      {settings.inputMode !== InputMode.MANUAL && (
        <>
          <Text style={[styles.sectionTitle, {marginTop: 32}]}>자동 감지 설정</Text>

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
              trackColor={{false: '#E0E0E0', true: '#81D4FA'}}
              thumbColor={settings.enableSedentaryDetection ? '#007AFF' : '#BDBDBD'}
            />
          </View>

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
              trackColor={{false: '#E0E0E0', true: '#81D4FA'}}
              thumbColor={settings.enableNotifications ? '#007AFF' : '#BDBDBD'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>감지 시간대</Text>
              <Text style={styles.settingDescription}>
                {settings.daytimeStartHour}시 ~ {settings.daytimeEndHour}시 사이에만 감지
              </Text>
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
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  modeHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modeNameSelected: {
    color: '#007AFF',
  },
  activeBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dataSourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dataSourceBadge: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dataSourceText: {
    fontSize: 12,
    color: '#1967D2',
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});

export default SettingsScreen;
