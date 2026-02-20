/**
 * 달력용 미니 뿜 아이콘
 * 해당 날짜의 미션 완료 상태를 보여줌
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PpoomState} from '../types';
import {PPOOM_STATE_INFO} from '../constants/ppoomData';

interface Props {
  state: PpoomState;
  allCompleted: boolean;
  size?: number;
}

const PpoomMiniIcon: React.FC<Props> = ({state, allCompleted, size = 24}) => {
  const info = PPOOM_STATE_INFO[state];

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Text style={{fontSize: size * 0.6}}>{info.emoji}</Text>
      {allCompleted && (
        <View style={[styles.completeDot, {backgroundColor: '#00C7BE'}]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default PpoomMiniIcon;
