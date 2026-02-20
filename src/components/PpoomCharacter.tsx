/**
 * 뿜 캐릭터 메인 비주얼
 * 상태별 이미지 + 레벨 성장 크기 + 숨쉬기 애니메이션 + 터치 반응
 */

import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, Animated, ImageSourcePropType} from 'react-native';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import {useFatigue} from '../contexts/FatigueContext';
import {PpoomState} from '../types';
import {MAX_LEVEL} from '../constants/ppoomData';
import {RADIUS} from '../utils/theme';

// 상태별 이미지 (5단계)
const PPOOM_STATE_IMAGES: Record<PpoomState, ImageSourcePropType> = {
  [PpoomState.CHARGED]: require('../../assets/ppoom/charged.png'),
  [PpoomState.GOOD]: require('../../assets/ppoom/normal.png'),
  [PpoomState.NORMAL]: require('../../assets/ppoom/default.png'),
  [PpoomState.TIRED]: require('../../assets/ppoom/tired.png'),
  [PpoomState.DISCHARGED]: require('../../assets/ppoom/discharged.png'),
};

const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '🩷'];

interface Props {
  /** 최대 크기 (레벨 MAX일 때). 레벨 1이면 이것의 50% */
  maxSize?: number;
  onPress?: () => void;
}

/**
 * 레벨 → 크기 비율 (0.5 ~ 1.0)
 * sqrt 곡선으로 초반에 쑥쑥, 후반에 천천히
 */
function getGrowthRatio(level: number): number {
  const MIN_RATIO = 0.5;
  const MAX_RATIO = 1.0;
  const t = Math.min((level - 1) / (MAX_LEVEL - 1), 1);
  const curved = Math.sqrt(t);
  return MIN_RATIO + curved * (MAX_RATIO - MIN_RATIO);
}

interface HeartParticle {
  id: number;
  emoji: string;
  x: number;
  opacity: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
}

const PpoomCharacter: React.FC<Props> = ({maxSize = 180, onPress}) => {
  const {ppoomState, stateInfo, equippedCostume, character, refreshDialogue} = usePpoom();
  const {fatiguePercentage} = useFatigue();
  const {isDark} = useTheme();

  const ratio = getGrowthRatio(character.level);
  const size = Math.round(maxSize * ratio);

  // 숨쉬기 애니메이션
  const breathAnim = useRef(new Animated.Value(1)).current;
  // 터치 흔들기 애니메이션
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // 하트 파티클
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const heartIdRef = useRef(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleTap = useCallback(() => {
    // 흔들기 애니메이션
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 1, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -1, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0.6, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -0.6, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 40, useNativeDriver: true}),
    ]).start();

    // 하트 파티클 생성 (3개)
    const newHearts: HeartParticle[] = Array.from({length: 3}).map((_, i) => {
      const id = ++heartIdRef.current;
      const particle: HeartParticle = {
        id,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        x: (Math.random() - 0.5) * size * 0.8,
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(0),
      };

      // 시차를 두고 애니메이션
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.translateY, {
            toValue: -60 - Math.random() * 30,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.spring(particle.scale, {toValue: 1, friction: 4, useNativeDriver: true}),
            Animated.timing(particle.scale, {toValue: 0.3, duration: 300, useNativeDriver: true}),
          ]),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            delay: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setHearts(prev => prev.filter(h => h.id !== id));
        });
      }, i * 120);

      return particle;
    });

    setHearts(prev => [...prev, ...newHearts]);

    // 대사 새로고침 + 외부 onPress
    refreshDialogue();
    onPress?.();
  }, [size, onPress, refreshDialogue]);

  const stateColor = isDark ? stateInfo.darkColor : stateInfo.color;
  const energyPercent = Math.max(0, 100 - fatiguePercentage);

  const shakeRotation = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <TouchableOpacity onPress={handleTap} activeOpacity={0.9}>
      <View style={[styles.wrapper, {width: maxSize, height: maxSize + 30}]}>
        {/* 하트 파티클 */}
        {hearts.map(heart => (
          <Animated.Text
            key={heart.id}
            style={[
              styles.heart,
              {
                left: maxSize / 2 + heart.x - 10,
                top: '20%',
                opacity: heart.opacity,
                transform: [
                  {translateY: heart.translateY},
                  {scale: heart.scale},
                ],
              },
            ]}>
            {heart.emoji}
          </Animated.Text>
        ))}

        <Animated.View
          style={[
            styles.container,
            {
              width: size,
              height: size,
              transform: [
                {scale: breathAnim},
                {rotate: shakeRotation},
              ],
            },
          ]}>
          {/* 캐릭터 이미지 */}
          <Image
            source={PPOOM_STATE_IMAGES[ppoomState]}
            style={[styles.characterImage, {width: size, height: size}]}
            resizeMode="contain"
          />

          {/* 코스튬 (장착된 경우) */}
          {equippedCostume && (
            <View style={[styles.costumeTag, {top: 0, right: 0}]}>
              <Text style={{fontSize: size * 0.15}}>{equippedCostume.emoji}</Text>
            </View>
          )}
        </Animated.View>

        {/* 에너지 게이지 바 (이미지 아래) */}
        <View style={styles.gaugeContainer}>
          <View style={[styles.gaugeTrack, {width: size * 0.6, backgroundColor: isDark ? '#333' : '#E5E5EA'}]}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${energyPercent}%`,
                  backgroundColor: stateColor,
                },
              ]}
            />
          </View>
        </View>

        {/* 레벨 배지 */}
        <View style={[styles.levelBadge, {backgroundColor: stateColor}]}>
          <Text style={styles.levelText}>Lv.{character.level}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    // 배경 투명 처리를 위해 별도 스타일 없음
  },
  costumeTag: {
    position: 'absolute',
  },
  heart: {
    position: 'absolute',
    fontSize: 20,
    zIndex: 10,
  },
  gaugeContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  gaugeTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  levelBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default PpoomCharacter;
