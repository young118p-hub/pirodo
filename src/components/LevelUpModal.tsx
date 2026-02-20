/**
 * 레벨업 축하 모달
 * 전체화면 오버레이 + 뿜이 성장 애니메이션 + 반짝이 효과
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS} from '../utils/theme';

const ppoomImage = require('../../assets/ppoom/charged.png');
const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  visible: boolean;
  newLevel: number;
  onClose: () => void;
}

// 반짝이 파티클 데이터
const SPARKLES = Array.from({length: 12}).map((_, i) => ({
  id: i,
  angle: (i / 12) * 2 * Math.PI,
  delay: i * 80,
  size: 8 + Math.random() * 12,
}));

const LevelUpModal: React.FC<Props> = ({visible, newLevel, onClose}) => {
  const {colors, isDark} = useTheme();

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const ppoomScale = useRef(new Animated.Value(0.3)).current;
  const ppoomRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(SPARKLES.map(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
    translateY: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    if (!visible) return;

    // 리셋
    bgOpacity.setValue(0);
    ppoomScale.setValue(0.3);
    ppoomRotate.setValue(0);
    textOpacity.setValue(0);
    textTranslate.setValue(30);
    buttonOpacity.setValue(0);
    sparkleAnims.forEach(a => {
      a.opacity.setValue(0);
      a.scale.setValue(0);
      a.translateY.setValue(0);
    });

    // 시퀀스 애니메이션
    Animated.sequence([
      // 1. 배경 페이드인
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 2. 뿜이 등장 (바운스)
      Animated.parallel([
        Animated.spring(ppoomScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        // 살짝 회전 흔들기
        Animated.sequence([
          Animated.timing(ppoomRotate, {toValue: -0.1, duration: 100, useNativeDriver: true}),
          Animated.timing(ppoomRotate, {toValue: 0.1, duration: 100, useNativeDriver: true}),
          Animated.timing(ppoomRotate, {toValue: -0.05, duration: 80, useNativeDriver: true}),
          Animated.timing(ppoomRotate, {toValue: 0, duration: 80, useNativeDriver: true}),
        ]),
      ]),
      // 3. 반짝이 터지기
      Animated.stagger(60, sparkleAnims.map(a =>
        Animated.parallel([
          Animated.timing(a.opacity, {toValue: 1, duration: 200, useNativeDriver: true}),
          Animated.spring(a.scale, {toValue: 1, friction: 5, useNativeDriver: true}),
          Animated.timing(a.translateY, {toValue: -40, duration: 600, useNativeDriver: true}),
        ]),
      )),
      // 4. 텍스트 등장
      Animated.parallel([
        Animated.timing(textOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.spring(textTranslate, {toValue: 0, friction: 6, useNativeDriver: true}),
      ]),
      // 5. 버튼 등장
      Animated.timing(buttonOpacity, {toValue: 1, duration: 200, useNativeDriver: true}),
    ]).start();

    // 반짝이 페이드아웃
    const fadeTimer = setTimeout(() => {
      sparkleAnims.forEach(a => {
        Animated.timing(a.opacity, {toValue: 0, duration: 500, useNativeDriver: true}).start();
      });
    }, 1500);

    return () => clearTimeout(fadeTimer);
  }, [visible]);

  if (!visible) return null;

  const rotateInterpolation = ppoomRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, {opacity: bgOpacity}]}>
        <View style={styles.center}>
          {/* 반짝이 파티클 */}
          {SPARKLES.map((sparkle, idx) => {
            const x = Math.cos(sparkle.angle) * 80;
            const y = Math.sin(sparkle.angle) * 80;
            return (
              <Animated.Text
                key={sparkle.id}
                style={[
                  styles.sparkle,
                  {
                    fontSize: sparkle.size,
                    left: SCREEN_WIDTH / 2 - 8 + x,
                    top: '38%',
                    opacity: sparkleAnims[idx].opacity,
                    transform: [
                      {scale: sparkleAnims[idx].scale},
                      {translateY: sparkleAnims[idx].translateY},
                      {translateX: x * 0.3},
                    ],
                  },
                ]}>
                {idx % 3 === 0 ? '✨' : idx % 3 === 1 ? '⭐' : '💫'}
              </Animated.Text>
            );
          })}

          {/* 뿜이 이미지 */}
          <Animated.View
            style={{
              transform: [
                {scale: ppoomScale},
                {rotate: rotateInterpolation},
              ],
            }}>
            <Image
              source={ppoomImage}
              style={styles.ppoomImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 레벨업 텍스트 */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{translateY: textTranslate}],
            }}>
            <Text style={styles.levelUpLabel}>LEVEL UP!</Text>
            <Text style={[styles.newLevel, {color: '#FFD700'}]}>
              Lv.{newLevel}
            </Text>
            <Text style={styles.encouragement}>
              {newLevel >= 25
                ? '거의 다 왔어! 전설의 뿜이!'
                : newLevel >= 15
                ? '멋지다! 뿜이가 쑥쑥 크고 있어!'
                : newLevel >= 5
                ? '좋아! 뿜이가 자라고 있어!'
                : '뿜이의 성장이 시작됐어!'}
            </Text>
          </Animated.View>

          {/* 확인 버튼 */}
          <Animated.View style={{opacity: buttonOpacity}}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>좋아요!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  ppoomImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  sparkle: {
    position: 'absolute',
  },
  levelUpLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  newLevel: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  encouragement: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFFCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});

export default LevelUpModal;
