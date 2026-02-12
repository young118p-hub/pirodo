/**
 * Pirodo V4 디자인 시스템
 * 통일된 색상, 그림자, 간격 상수
 */

export const COLORS = {
  // 배경
  background: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // 텍스트
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',

  // 구분선
  divider: '#F0F0F5',

  // 피로도 컬러 (배터리 초록과 차별화)
  fatigue: {
    excellent: '#00C7BE', // 민트/시안
    good: '#5856D6',      // 보라
    tired: '#FF9F0A',     // 앰버
    exhausted: '#FF453A', // 레드
  },

  // 게이지
  gaugeBackground: '#E5E5EA',
  gaugeTick: '#C7C7CC',

  // 지표 카드 배경색 (10% 알파)
  metricBg: {
    steps: '#F0F5FF',    // 블루 틴트
    sleep: '#F3F0FF',    // 보라 틴트
    heart: '#FFF0F0',    // 레드 틴트
    sitting: '#FFF5EB',  // 앰버 틴트
  },

  // 액센트
  accent: '#5856D6',
  accentLight: '#EEEDFC',

  // 기타
  white: '#FFFFFF',
  black: '#000000',
};

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
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: COLORS.textTertiary,
  },
};
