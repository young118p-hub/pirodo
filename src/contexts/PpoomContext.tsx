/**
 * 뿜(PPOOM) 캐릭터 & 미션 Context
 * FatigueContext의 fatiguePercentage를 읽어 뿜 상태를 결정하고
 * 일일 미션 관리, 캐릭터 성장, 스트릭을 담당한다.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  PpoomState,
  PpoomCharacterData,
  PpoomSaveData,
  DailyMission,
  DailyMissionData,
  MissionHistoryRecord,
  StreakData,
  CostumeItem,
} from '../types';
import {useFatigue} from './FatigueContext';
import {getPpoomStateFromFatigue, PPOOM_STATE_INFO, ALL_COSTUMES, getCurrentTimeSlot, TIME_DIALOGUES} from '../constants/ppoomData';
import {assignDailyMissions} from '../utils/missionEngine';
import {addExp, getExpProgress} from '../utils/levelEngine';
import {updateStreak, applyStreakBonus} from '../utils/streakEngine';
import {PpoomStorageService} from '../services/PpoomStorageService';
import {showPpoomNotification} from '../components/PpoomNotification';
import {getLocalDateString} from '../utils/dateUtils';

// ============================================================
// Context 타입
// ============================================================

interface PpoomContextType {
  // 캐릭터 상태
  ppoomState: PpoomState;
  stateInfo: typeof PPOOM_STATE_INFO[PpoomState];
  dialogue: string;
  character: PpoomCharacterData;
  expProgress: number; // 0~1

  // 미션
  todayMissions: DailyMission[];
  allMissionsCompleted: boolean;
  completeMission: (templateId: string) => void;

  // 스트릭
  streak: StreakData;

  // 코스튬
  equippedCostume: CostumeItem | null;
  unlockedCostumes: CostumeItem[];
  allCostumes: CostumeItem[];
  equipCostume: (costumeId: string) => void;
  isCostumeUnlocked: (costume: CostumeItem) => boolean;

  // 미션 히스토리
  missionHistory: MissionHistoryRecord[];

  // 대사 새로고침
  refreshDialogue: () => void;

  // 이벤트
  levelUpEvent: {level: number} | null;
  expGainEvent: {amount: number} | null;
  clearLevelUpEvent: () => void;

  // 로딩
  isLoading: boolean;
}

const PpoomContext = createContext<PpoomContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export const PpoomProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {fatiguePercentage} = useFatigue();

  const [saveData, setSaveData] = useState<PpoomSaveData>(PpoomStorageService.getDefault());
  const [isLoading, setIsLoading] = useState(true);
  const [dialogue, setDialogue] = useState('');
  const [levelUpEvent, setLevelUpEvent] = useState<{level: number} | null>(null);
  const [expGainEvent, setExpGainEvent] = useState<{amount: number} | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDateRef = useRef<string>('');

  // 뿜 상태 계산
  const ppoomState = getPpoomStateFromFatigue(fatiguePercentage);
  const stateInfo = PPOOM_STATE_INFO[ppoomState];

  // ============================================================
  // 초기 로드
  // ============================================================
  useEffect(() => {
    (async () => {
      const loaded = await PpoomStorageService.load();
      setSaveData(loaded);
      setIsLoading(false);
    })();
  }, []);

  // ============================================================
  // 대사 생성
  // ============================================================
  const pickDialogue = useCallback(() => {
    // 30% 확률로 시간대별 대사, 70% 상태별 대사
    if (Math.random() < 0.3) {
      const timeSlot = getCurrentTimeSlot();
      const timeDialogues = TIME_DIALOGUES[timeSlot];
      setDialogue(timeDialogues[Math.floor(Math.random() * timeDialogues.length)]);
    } else {
      const dialogues = stateInfo.dialogues;
      setDialogue(dialogues[Math.floor(Math.random() * dialogues.length)]);
    }
  }, [stateInfo]);

  // 상태 변경 시 대사 갱신
  useEffect(() => {
    pickDialogue();
  }, [ppoomState, pickDialogue]);

  const refreshDialogue = useCallback(() => {
    pickDialogue();
  }, [pickDialogue]);

  // ============================================================
  // 디바운스 저장
  // ============================================================
  const scheduleSave = useCallback((data: PpoomSaveData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      PpoomStorageService.save(data);
    }, 1000);
  }, []);

  // ============================================================
  // 날짜 변경 감지 → 새 미션 할당
  // ============================================================
  useEffect(() => {
    if (isLoading) return;

    const today = getLocalDateString();
    const currentMissionDate = saveData.currentMissions?.date;

    if (currentMissionDate === today) {
      lastDateRef.current = today;
      return;
    }

    // functional updater로 stale closure 방지
    setSaveData(prev => {
      // 이미 오늘 미션이면 스킵
      if (prev.currentMissions?.date === today) return prev;

      // 이전 미션을 히스토리로 이동
      const updatedHistory = [...prev.missionHistory];
      if (prev.currentMissions && prev.currentMissions.date !== today) {
        updatedHistory.push({
          date: prev.currentMissions.date,
          missions: prev.currentMissions.missions,
          allCompleted: prev.currentMissions.allCompleted,
          fatiguePercentage,
        });
        while (updatedHistory.length > 90) {
          updatedHistory.shift();
        }
      }

      // 새 미션 할당
      const newMissions = assignDailyMissions(fatiguePercentage, updatedHistory);
      const newMissionData: DailyMissionData = {
        date: today,
        missions: newMissions,
        allCompleted: false,
      };

      const updated: PpoomSaveData = {
        ...prev,
        missionHistory: updatedHistory,
        currentMissions: newMissionData,
      };

      scheduleSave(updated);
      return updated;
    });
    lastDateRef.current = today;
  }, [isLoading, saveData.currentMissions?.date, fatiguePercentage]);

  // 1분마다 날짜 변경 체크
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getLocalDateString();
      if (lastDateRef.current && lastDateRef.current !== today) {
        setSaveData(prev => ({...prev}));
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 스트릭 끊길 위험 알림 (20시에 1회 체크)
  const streakAlertSentRef = useRef(false);
  useEffect(() => {
    if (isLoading) return;
    const checkStreakRisk = () => {
      const hour = new Date().getHours();
      // 20시~22시, 오늘 미션 미완료, 스트릭 3일 이상일 때
      if (
        hour >= 20 && hour < 22 &&
        !streakAlertSentRef.current &&
        saveData.streak.currentStreak >= 3 &&
        saveData.currentMissions &&
        !saveData.currentMissions.allCompleted
      ) {
        const remaining = saveData.currentMissions.missions.filter(m => !m.completed).length;
        streakAlertSentRef.current = true;
        showPpoomNotification({
          title: '스트릭 위험!',
          body: `${saveData.streak.currentStreak}일 연속 기록이 끊길 수 있어요! 미션 ${remaining}개 남았어요`,
          fatiguePercentage,
        });
      }
      // 날짜가 바뀌면 리셋
      if (hour < 20) {
        streakAlertSentRef.current = false;
      }
    };
    checkStreakRisk();
    const interval = setInterval(checkStreakRisk, 5 * 60 * 1000); // 5분마다
    return () => clearInterval(interval);
  }, [isLoading, saveData.currentMissions?.allCompleted, saveData.streak.currentStreak]);

  // ============================================================
  // 코스튬 해금 체크
  // ============================================================
  const checkCostumeUnlocks = useCallback((data: PpoomSaveData): PpoomSaveData => {
    const totalMissions = data.missionHistory.reduce(
      (sum, record) => sum + record.missions.filter(m => m.completed).length,
      0,
    );
    // 현재 미션도 카운트
    const currentCompleted = data.currentMissions?.missions.filter(m => m.completed).length || 0;
    const allMissionCount = totalMissions + currentCompleted;

    const newUnlocks: string[] = [];
    for (const costume of ALL_COSTUMES) {
      if (data.character.unlockedCostumeIds.includes(costume.id)) continue;

      const cond = costume.unlockCondition;
      let unlocked = false;

      if (cond.type === 'default') {
        unlocked = true;
      } else if (cond.type === 'level') {
        unlocked = data.character.level >= cond.level;
      } else if (cond.type === 'streak') {
        unlocked = data.streak.longestStreak >= cond.days;
      } else if (cond.type === 'missions') {
        unlocked = allMissionCount >= cond.count;
      }

      if (unlocked) newUnlocks.push(costume.id);
    }

    if (newUnlocks.length === 0) return data;

    return {
      ...data,
      character: {
        ...data.character,
        unlockedCostumeIds: [...data.character.unlockedCostumeIds, ...newUnlocks],
      },
    };
  }, []);

  // ============================================================
  // 미션 완료
  // ============================================================
  const completeMission = useCallback((templateId: string) => {
    setSaveData(prev => {
      if (!prev.currentMissions) return prev;

      // 이미 완료된 미션이면 무시 (중복 완료 방지)
      const target = prev.currentMissions.missions.find(m => m.templateId === templateId);
      if (!target || target.completed) return prev;

      const missions = prev.currentMissions.missions.map(m =>
        m.templateId === templateId
          ? {...m, completed: true, completedAt: new Date().toISOString()}
          : m,
      );

      const justCompleted = missions.find(m => m.templateId === templateId)!;

      // 경험치 계산 (스트릭 보너스 적용)
      const bonusExp = applyStreakBonus(justCompleted.expReward, prev.streak.currentStreak);
      const levelResult = addExp(prev.character, bonusExp);

      // 이벤트 발생 (UI 피드백용)
      setExpGainEvent({amount: bonusExp});
      if (levelResult.leveledUp) {
        setTimeout(() => setLevelUpEvent({level: levelResult.newLevel}), 600);
      }

      const allCompleted = missions.every(m => m.completed);

      // 스트릭 업데이트 (모든 미션 완료 시)
      let updatedStreak = prev.streak;
      if (allCompleted) {
        const today = getLocalDateString();
        updatedStreak = updateStreak(prev.streak, today);
      }

      let updated: PpoomSaveData = {
        ...prev,
        character: levelResult.character,
        streak: updatedStreak,
        currentMissions: {
          ...prev.currentMissions,
          missions,
          allCompleted,
        },
      };

      // 코스튬 해금 체크
      updated = checkCostumeUnlocks(updated);

      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave, checkCostumeUnlocks]);

  // ============================================================
  // 코스튬 장착
  // ============================================================
  const equipCostume = useCallback((costumeId: string) => {
    setSaveData(prev => {
      if (!prev.character.unlockedCostumeIds.includes(costumeId)) return prev;
      const updated: PpoomSaveData = {
        ...prev,
        character: {
          ...prev.character,
          equippedCostumeId: costumeId === prev.character.equippedCostumeId ? null : costumeId,
        },
      };
      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave]);

  // ============================================================
  // 코스튬 해금 확인
  // ============================================================
  const isCostumeUnlocked = useCallback((costume: CostumeItem): boolean => {
    return saveData.character.unlockedCostumeIds.includes(costume.id);
  }, [saveData.character.unlockedCostumeIds]);

  // ============================================================
  // 파생 데이터
  // ============================================================
  const todayMissions = saveData.currentMissions?.missions || [];
  const allMissionsCompleted = saveData.currentMissions?.allCompleted || false;

  const equippedCostume = saveData.character.equippedCostumeId
    ? ALL_COSTUMES.find(c => c.id === saveData.character.equippedCostumeId) || null
    : null;

  const unlockedCostumes = ALL_COSTUMES.filter(c =>
    saveData.character.unlockedCostumeIds.includes(c.id),
  );

  const expProgressValue = getExpProgress(saveData.character);

  // ============================================================
  // Context value
  // ============================================================
  const value: PpoomContextType = {
    ppoomState,
    stateInfo,
    dialogue,
    character: saveData.character,
    expProgress: expProgressValue,
    todayMissions,
    allMissionsCompleted,
    completeMission,
    streak: saveData.streak,
    equippedCostume,
    unlockedCostumes,
    allCostumes: ALL_COSTUMES,
    equipCostume,
    isCostumeUnlocked,
    missionHistory: saveData.missionHistory,
    refreshDialogue,
    levelUpEvent,
    expGainEvent,
    clearLevelUpEvent: () => setLevelUpEvent(null),
    isLoading,
  };

  return (
    <PpoomContext.Provider value={value}>
      {children}
    </PpoomContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export function usePpoom(): PpoomContextType {
  const context = useContext(PpoomContext);
  if (!context) {
    throw new Error('usePpoom must be used within PpoomProvider');
  }
  return context;
}
