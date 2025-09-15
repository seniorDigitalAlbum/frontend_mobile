/**
 * useAutoAccessibility.ts - 자동 접근성 적용 훅
 * 
 * 기존 Tailwind 클래스명을 자동으로 접근성에 맞게 변환해주는 훅입니다.
 * 이 훅을 사용하면 기존 코드를 거의 수정하지 않고도 접근성 기능을 적용할 수 있습니다.
 */

import { useAccessibility } from '../contexts/AccessibilityContext';

export function useAutoAccessibility() {
  const { settings } = useAccessibility();

  // Tailwind 클래스명을 접근성에 맞게 자동 변환
  const autoClass = (baseClasses: string) => {
    let classes = baseClasses;

    if (settings.isLargeTextMode) {
      // 텍스트 크기 자동 증가
      classes = classes.replace(/text-xs/g, 'text-sm');
      classes = classes.replace(/text-sm/g, 'text-base');
      classes = classes.replace(/text-base/g, 'text-lg');
      classes = classes.replace(/text-lg/g, 'text-xl');
      classes = classes.replace(/text-xl/g, 'text-2xl');
      classes = classes.replace(/text-2xl/g, 'text-3xl');
      classes = classes.replace(/text-3xl/g, 'text-4xl');

      // 패딩과 마진 자동 증가
      classes = classes.replace(/p-1/g, 'p-2');
      classes = classes.replace(/p-2/g, 'p-3');
      classes = classes.replace(/p-3/g, 'p-4');
      classes = classes.replace(/p-4/g, 'p-6');
      classes = classes.replace(/p-6/g, 'p-8');

      classes = classes.replace(/m-1/g, 'm-2');
      classes = classes.replace(/m-2/g, 'm-3');
      classes = classes.replace(/m-3/g, 'm-4');
      classes = classes.replace(/m-4/g, 'm-6');
      classes = classes.replace(/m-6/g, 'm-8');

      // 높이 자동 증가
      classes = classes.replace(/h-8/g, 'h-10');
      classes = classes.replace(/h-10/g, 'h-12');
      classes = classes.replace(/h-12/g, 'h-16');
      classes = classes.replace(/h-16/g, 'h-20');
    }

    if (settings.isHighContrastMode) {
      // 색상 자동 변환
      classes = classes.replace(/text-gray-\d+/g, 'text-white');
      classes = classes.replace(/text-black/g, 'text-white');
      classes = classes.replace(/bg-white/g, 'bg-black');
      classes = classes.replace(/bg-gray-\d+/g, 'bg-black');
      classes = classes.replace(/border-gray-\d+/g, 'border-white');
    }

    return classes;
  };

  // 인라인 스타일 자동 변환
  const autoStyle = (baseStyle: any) => {
    const style = { ...baseStyle };

    if (settings.isLargeTextMode) {
      if (style.fontSize) {
        style.fontSize = style.fontSize * 1.3;
      }
      if (style.padding) {
        style.padding = style.padding * 1.2;
      }
      if (style.margin) {
        style.margin = style.margin * 1.2;
      }
    }

    if (settings.isHighContrastMode) {
      if (style.color && style.color.includes('gray')) {
        style.color = '#ffffff';
      }
      if (style.backgroundColor && style.backgroundColor.includes('white')) {
        style.backgroundColor = '#000000';
      }
    }

    return style;
  };

  return {
    settings,
    autoClass,
    autoStyle,
  };
}
