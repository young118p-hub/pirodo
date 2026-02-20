/**
 * Pirodo V4 디자인 시스템
 * 통일된 색상, 그림자, 간격 상수 (라이트/다크 모드)
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  fatigue: {
    excellent: string;
    good: string;
    tired: string;
    exhausted: string;
  };
  gaugeBackground: string;
  gaugeTick: string;
  metricBg: {
    steps: string;
    sleep: string;
    heart: string;
    sitting: string;
  };
  ppoom: {
    charged: string;
    normal: string;
    tired: string;
    discharged: string;
  };
  mission: {
    easy: string;
    normal: string;
    challenge: string;
  };
  rarity: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
  accent: string;
  accentLight: string;
  white: string;
  black: string;
}

export const LIGHT_COLORS: ThemeColors = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  divider: '#F0F0F5',
  fatigue: {
    excellent: '#00C7BE',
    good: '#5856D6',
    tired: '#FF9F0A',
    exhausted: '#FF453A',
  },
  gaugeBackground: '#E5E5EA',
  gaugeTick: '#C7C7CC',
  metricBg: {
    steps: '#F0F5FF',
    sleep: '#F3F0FF',
    heart: '#FFF0F0',
    sitting: '#FFF5EB',
  },
  ppoom: {
    charged: '#00C7BE',
    normal: '#5856D6',
    tired: '#FF9F0A',
    discharged: '#FF453A',
  },
  mission: {
    easy: '#E8FAF9',
    normal: '#EEEDFC',
    challenge: '#FFF5EB',
  },
  rarity: {
    common: '#C7C7CC',
    rare: '#5856D6',
    epic: '#FF9F0A',
    legendary: '#FF453A',
  },
  accent: '#5856D6',
  accentLight: '#EEEDFC',
  white: '#FFFFFF',
  black: '#000000',
};

export const DARK_COLORS: ThemeColors = {
  background: '#0D0D0F',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  textPrimary: '#F5F5F7',
  textSecondary: '#98989D',
  textTertiary: '#636366',
  divider: '#2C2C2E',
  fatigue: {
    excellent: '#00C7BE',
    good: '#7B7AE0',
    tired: '#FFB340',
    exhausted: '#FF6961',
  },
  gaugeBackground: '#3A3A3C',
  gaugeTick: '#48484A',
  metricBg: {
    steps: '#1A1F2E',
    sleep: '#1E1A2E',
    heart: '#2E1A1A',
    sitting: '#2E2418',
  },
  ppoom: {
    charged: '#00C7BE',
    normal: '#7B7AE0',
    tired: '#FFB340',
    discharged: '#FF6961',
  },
  mission: {
    easy: '#0D2E2C',
    normal: '#1E1D3A',
    challenge: '#2E2418',
  },
  rarity: {
    common: '#636366',
    rare: '#7B7AE0',
    epic: '#FFB340',
    legendary: '#FF6961',
  },
  accent: '#7B7AE0',
  accentLight: '#28274A',
  white: '#FFFFFF',
  black: '#000000',
};

// 기본값 (라이트) - 하위 호환
export const COLORS = LIGHT_COLORS;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const DARK_SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const SPACING = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 16,
  itemGap: 10,
};

export const RADIUS = {
  card: 20,
  cardLarge: 24,
  small: 12,
  pill: 100,
  circle: 9999,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};
