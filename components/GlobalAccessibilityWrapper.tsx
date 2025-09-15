/**
 * GlobalAccessibilityWrapper.tsx - 전역 접근성 래퍼
 * 
 * 전체 앱을 감싸서 접근성 설정을 전역적으로 적용합니다.
 * 이 컴포넌트 하나만 추가하면 모든 화면에 접근성 기능이 자동으로 적용됩니다.
 */

import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface GlobalAccessibilityWrapperProps {
  children: ReactNode;
}

export default function GlobalAccessibilityWrapper({ children }: GlobalAccessibilityWrapperProps) {
  const { settings } = useAccessibility();

  // 접근성 설정에 따른 클래스 조합
  const getAccessibilityClasses = () => {
    let classes = '';
    
    // 큰 글씨 모드
    if (settings.isLargeTextMode) {
      classes += ' large-text-mode';
    }
    
    // 고대비 모드
    if (settings.isHighContrastMode) {
      classes += ' high-contrast-mode';
    }
    
    return classes;
  };

  return (
    <View className={getAccessibilityClasses()} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
