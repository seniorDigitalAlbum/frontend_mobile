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
});

// 그라데이션 색상 배열 (LinearGradient 컴포넌트용)
export const gradientColors = ['#fad0c4', '#ffd1ff'];

// 새로운 그라데이션 색상 배열
export const blueGradientColors = ['#a1c4fd', '#c2e9fb'];

// 그라데이션 배경 스타일
export const gradientBackground = {
  backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
};