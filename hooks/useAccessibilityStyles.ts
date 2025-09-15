/**
 * useAccessibilityStyles.ts - 접근성 스타일 훅
 * 
 * 접근성 설정에 따라 동적으로 스타일을 반환하는 커스텀 훅입니다.
 * 큰 글씨 모드와 고대비 모드에 따른 스타일을 쉽게 적용할 수 있습니다.
 */

import { useAccessibility } from '../contexts/AccessibilityContext';

export function useAccessibilityStyles() {
  const { settings } = useAccessibility();

  const getTextSize = (baseSize: string, largeSize?: string) => {
    if (settings.isLargeTextMode) {
      return largeSize || baseSize.replace(/\d+/, (match) => String(Math.round(parseInt(match) * 1.3)));
    }
    return baseSize;
  };

  const getPadding = (basePadding: string, largePadding?: string) => {
    if (settings.isLargeTextMode) {
      return largePadding || basePadding;
    }
    return basePadding;
  };

  const getMargin = (baseMargin: string, largeMargin?: string) => {
    if (settings.isLargeTextMode) {
      return largeMargin || baseMargin;
    }
    return baseMargin;
  };

  const getTextColor = (normalColor: string, highContrastColor?: string) => {
    if (settings.isHighContrastMode) {
      return highContrastColor || (normalColor.includes('gray') ? 'text-white' : normalColor);
    }
    return normalColor;
  };

  const getBackgroundColor = (normalColor: string, highContrastColor?: string) => {
    if (settings.isHighContrastMode) {
      return highContrastColor || (normalColor.includes('white') ? 'bg-black' : normalColor);
    }
    return normalColor;
  };

  const getBorderColor = (normalColor: string, highContrastColor?: string) => {
    if (settings.isHighContrastMode) {
      return highContrastColor || 'border-white';
    }
    return normalColor;
  };

  const getButtonStyle = (baseStyle: string, largeStyle?: string) => {
    let style = baseStyle;
    
    if (settings.isLargeTextMode && largeStyle) {
      style = largeStyle;
    }
    
    if (settings.isHighContrastMode) {
      style = style.replace(/bg-\w+-\d+/, 'bg-white').replace(/text-\w+-\d+/, 'text-black');
    }
    
    return style;
  };

  const getContainerStyle = (baseStyle: string, largeStyle?: string) => {
    let style = baseStyle;
    
    if (settings.isLargeTextMode && largeStyle) {
      style = largeStyle;
    }
    
    if (settings.isHighContrastMode) {
      style = style.replace(/bg-\w+-\d+/, 'bg-black').replace(/text-\w+-\d+/, 'text-white');
    }
    
    return style;
  };

  return {
    settings,
    getTextSize,
    getPadding,
    getMargin,
    getTextColor,
    getBackgroundColor,
    getBorderColor,
    getButtonStyle,
    getContainerStyle,
  };
}
