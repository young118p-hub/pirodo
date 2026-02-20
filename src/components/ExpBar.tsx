/**
 * 경험치 진행 바
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {usePpoom} from '../contexts/PpoomContext';
import {useTheme} from '../contexts/ThemeContext';
import {getRequiredExp} from '../constants/ppoomData';
import {RADIUS} from '../utils/theme';

const ExpBar: React.FC = () => {
  const {character, expProgress} = usePpoom();
  const {colors, isDark} = useTheme();

  const required = getRequiredExp(character.level);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, {color: colors.textSecondary}]}>
          EXP
        </Text>
        <Text style={[styles.value, {color: colors.textSecondary}]}>
          {character.exp}/{required}
        </Text>
      </View>
      <View style={[styles.track, {backgroundColor: isDark ? '#333' : '#E5E5EA'}]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(expProgress * 100)}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    fontSize: 11,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ExpBar;
