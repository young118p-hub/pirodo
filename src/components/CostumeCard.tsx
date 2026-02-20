/**
 * 옷장 코스튬 카드
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {CostumeItem, CostumeRarity} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS} from '../utils/theme';

interface Props {
  costume: CostumeItem;
  isUnlocked: boolean;
  isEquipped: boolean;
  onPress: () => void;
}

const RARITY_COLORS: Record<CostumeRarity, {light: string; dark: string; border: string}> = {
  common: {light: '#F2F4F8', dark: '#1C1C1E', border: '#C7C7CC'},
  rare: {light: '#EEEDFC', dark: '#1E1D3A', border: '#5856D6'},
  epic: {light: '#FFF5EB', dark: '#2E2418', border: '#FF9F0A'},
  legendary: {light: '#FFF0F0', dark: '#2E1A1A', border: '#FF453A'},
};

const RARITY_LABELS: Record<CostumeRarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '에픽',
  legendary: '전설',
};

const CostumeCard: React.FC<Props> = ({costume, isUnlocked, isEquipped, onPress}) => {
  const {colors, isDark} = useTheme();
  const rarityInfo = RARITY_COLORS[costume.rarity];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? rarityInfo.dark : rarityInfo.light,
          borderColor: isEquipped ? rarityInfo.border : 'transparent',
          borderWidth: isEquipped ? 2 : 0,
          opacity: isUnlocked ? 1 : 0.4,
        },
      ]}>
      <Text style={styles.emoji}>
        {isUnlocked ? costume.emoji : '🔒'}
      </Text>
      <Text
        style={[styles.name, {color: colors.textPrimary}]}
        numberOfLines={1}>
        {isUnlocked ? costume.name : '???'}
      </Text>
      <Text style={[styles.rarity, {color: rarityInfo.border}]}>
        {RARITY_LABELS[costume.rarity]}
      </Text>
      {isEquipped && (
        <View style={[styles.equippedBadge, {backgroundColor: rarityInfo.border}]}>
          <Text style={styles.equippedText}>착용중</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    margin: '1.5%',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  rarity: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  equippedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equippedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default CostumeCard;
