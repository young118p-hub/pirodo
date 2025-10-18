/**
 * 활동 추가 화면
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
import {ActivityType} from '../types';
import {ACTIVITY_TYPE_INFO} from '../utils/constants';

interface AddActivityScreenProps {
  navigation: any;
}

const AddActivityScreen: React.FC<AddActivityScreenProps> = ({navigation}) => {
  const {addActivity} = useFatigue();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!selectedType) {
      Alert.alert('알림', '활동 유형을 선택해주세요.');
      return;
    }

    const totalMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0');

    if (totalMinutes <= 0) {
      Alert.alert('알림', '시간을 입력해주세요.');
      return;
    }

    addActivity(selectedType, totalMinutes, note || undefined);
    Alert.alert('완료', '활동이 추가되었습니다.', [
      {text: '확인', onPress: () => navigation.goBack()},
    ]);
  };

  // 활동 타입을 피로/회복으로 그룹화
  const fatigueActivities = Object.values(ACTIVITY_TYPE_INFO).filter(
    info => !info.isRecovery,
  );
  const recoveryActivities = Object.values(ACTIVITY_TYPE_INFO).filter(
    info => info.isRecovery,
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 피로 증가 활동 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>피로 증가 활동</Text>
          <View style={styles.grid}>
            {fatigueActivities.map(info => (
              <TouchableOpacity
                key={info.type}
                style={[
                  styles.activityCard,
                  selectedType === info.type && styles.activityCardSelected,
                ]}
                onPress={() => setSelectedType(info.type)}>
                <Text style={styles.activityEmoji}>{info.emoji}</Text>
                <Text style={styles.activityName}>{info.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 회복 활동 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>회복 활동</Text>
          <View style={styles.grid}>
            {recoveryActivities.map(info => (
              <TouchableOpacity
                key={info.type}
                style={[
                  styles.activityCard,
                  styles.recoveryCard,
                  selectedType === info.type &&
                    styles.activityCardSelectedRecovery,
                ]}
                onPress={() => setSelectedType(info.type)}>
                <Text style={styles.activityEmoji}>{info.emoji}</Text>
                <Text style={styles.activityName}>{info.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 시간 입력 */}
        {selectedType && (
          <View style={styles.timeSection}>
            <Text style={styles.sectionTitle}>시간 입력</Text>
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeTextInput}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.timeLabel}>시간</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeTextInput}
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.timeLabel}>분</Text>
              </View>
            </View>
          </View>
        )}

        {/* 메모 (선택사항) */}
        {selectedType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모 (선택사항)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="메모를 입력하세요..."
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* 추가 버튼 */}
        {selectedType && (
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
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
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recoveryCard: {
    backgroundColor: '#F0F8FF',
  },
  activityCardSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  activityCardSelectedRecovery: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  activityEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  activityName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  timeSection: {
    marginBottom: 30,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  timeInput: {
    alignItems: 'center',
  },
  timeTextInput: {
    fontSize: 48,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'center',
    color: '#007AFF',
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginHorizontal: 10,
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddActivityScreen;
