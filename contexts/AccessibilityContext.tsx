/**
 * AccessibilityContext.tsx - 접근성 설정 관리 Context
 * 
 * 큰 글씨 모드, 고대비 모드 등 접근성 관련 설정을 전역적으로 관리합니다.
 * 
 * 주요 기능:
 * - 큰 글씨 모드 토글
 * - 폰트 크기 설정 관리
 * - 접근성 설정 영구 저장
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  isLargeTextMode: boolean;
  isHighContrastMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleLargeTextMode: () => void;
  toggleHighContrastMode: () => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  isLargeTextMode: false,
  isHighContrastMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // AsyncStorage에서 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('접근성 설정 불러오기 실패:', error);
    }
  };

  // AsyncStorage에 설정 저장
  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('접근성 설정 저장 실패:', error);
    }
  };

  const toggleLargeTextMode = () => {
    const newSettings: AccessibilitySettings = {
      ...settings,
      isLargeTextMode: !settings.isLargeTextMode,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };



  const toggleHighContrastMode = () => {
    const newSettings: AccessibilitySettings = {
      ...settings,
      isHighContrastMode: !settings.isHighContrastMode,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  const value: AccessibilityContextType = {
    settings,
    toggleLargeTextMode,
    toggleHighContrastMode,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
