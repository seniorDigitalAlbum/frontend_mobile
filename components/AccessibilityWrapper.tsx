/**
 * AccessibilityWrapper.tsx - 접근성 래퍼 컴포넌트
 * 
 * 모든 화면을 감싸서 큰 글씨 모드와 고대비 모드를 전역적으로 적용합니다.
 * 이 컴포넌트를 사용하면 각 화면마다 개별적으로 접근성 설정을 적용할 필요가 없습니다.
 */

import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface AccessibilityWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function AccessibilityWrapper({ children, className = '' }: AccessibilityWrapperProps) {
  const { settings } = useAccessibility();

  // 큰 글씨 모드와 고대비 모드에 따른 클래스 조합
  const getWrapperClasses = () => {
    let classes = className;
    
    if (settings.isLargeTextMode) {
      classes += ' large-text-mode';
    }
    
    if (settings.isHighContrastMode) {
      classes += ' high-contrast-mode';
    }
    
    return classes;
  };

  // 고대비 모드에 따른 배경색 스타일
  const getBackgroundStyle = () => {
    if (settings.isHighContrastMode) {
      return { backgroundColor: '#000000' };
    }
    return {};
  };

  return (
    <View 
      className={getWrapperClasses()}
      style={getBackgroundStyle()}
    >
      {children}
    </View>
  );
}
