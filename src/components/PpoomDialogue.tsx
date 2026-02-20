/**
 * 뿜 말풍선 (타이핑 효과)
 */

import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, SPACING, TYPOGRAPHY} from '../utils/theme';

interface Props {
  text: string;
  onTap?: () => void;
}

const PpoomDialogue: React.FC<Props> = ({text, onTap}) => {
  const {colors, shadows, isDark} = useTheme();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    indexRef.current = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayText(text);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayText(text.slice(0, indexRef.current));
      }
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <TouchableOpacity
      onPress={onTap}
      activeOpacity={0.8}
      style={[
        styles.container,
        {backgroundColor: colors.surface},
        shadows.card,
      ]}>
      <Text style={[styles.text, {color: colors.textPrimary}]}>
        {displayText}
        {isTyping && <Text style={{color: colors.textTertiary}}>|</Text>}
      </Text>
      {/* 말풍선 꼬리 */}
      <View
        style={[
          styles.tail,
          {
            borderTopColor: colors.surface,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.card,
    alignSelf: 'center',
    maxWidth: '85%',
    minHeight: 44,
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default PpoomDialogue;
