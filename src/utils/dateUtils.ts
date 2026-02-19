/**
 * 로컬 시간대 기준 날짜 유틸리티
 * toISOString()은 UTC 기준이라 KST(+9)에서 자정~오전 9시 사이에 전날 날짜가 됨
 */

/**
 * 로컬 시간대 기준 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
