import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  cardStyle: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
    borderRadius: 12,
  },
  glassCardStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#999',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
    borderRadius: 12,
  },
  gradientGlassEffect: {
    // 그라데이션과 글래스 효과를 합친 스타일
    // 실제로는 GradientGlassEffect 컴포넌트를 사용하는 것이 더 좋습니다
    backgroundColor: 'rgba(0, 0, 0, 0)', // 그라데이션 중간색 + 투명도
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  whiteToGreenGradient: {
    // 흰색에서 연한 녹색으로의 원형 그라디언트
    // 실제 그라디언트는 RadialGradient 컴포넌트로 구현해야 함
    backgroundColor: '#ffffff', // 기본 배경색 (흰색)
  },
});

// 그라데이션 색상 배열 (LinearGradient 컴포넌트용)
export const gradientColors = ['#fad0c4', '#ffd1ff'];

// 새로운 그라데이션 색상 배열
export const blueGradientColors = ['#a1c4fd', '#c2e9fb'];

// 흰색에서 연한 녹색으로의 그라디언트 색상 배열
export const whiteToGreenGradientColors = ['#ffffff', '#bcd9b6'];

// 그라데이션 배경 스타일
export const gradientBackground = {
  backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
};


// 추가 그라데이션 색상 배열들
export const purpleGradientColors = ['#a18cd1', '#fbc2eb'];
export const pinkGradientColors = ['#fad0c4', '#ffd1ff'];
export const lightPurpleGradientColors = ['#fdcbf1', '#e6dee9'];

// 새로운 그라데이션 색상 배열 (rainbow gradient)
export const rainbowGradientColors = [
  '#d16ba5', '#c777b9', '#ba83ca', '#aa8fd8', '#9a9ae1', 
  '#8aa7ec', '#79b3f4', '#69bff8', '#52cffe', '#41dfff', 
  '#46eefa', '#5ffbf1'
];

// 색상 상수들
export const colors = {
  // 그린 계열
  green: '#67876C',
  darkGreen: '#103713',
  
  // 베이지/크림 계열
  beige: '#E2DBD0',
  cream: '#FFFDF5',
  
  // 기본 색상들
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};