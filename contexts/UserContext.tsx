import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/user/userService';
import kakaoAuthService from '../services/kakaoAuthService';

export enum UserType {
  SENIOR = 'SENIOR',
  GUARDIAN = 'GUARDIAN'
}

export interface User {
  id: string;
  userId: string;
  name: string;
  phone: string;
  userType: UserType | null;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  // kakaoAccessToken은 백엔드에서 관리
  gender?: string;
  token?: string;
}

interface UserContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setUserType: (type: UserType) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      let storedUser: string | null = null;
      let storedUserType: string | null = null;
      
      if (Platform.OS === 'web') {
        // 웹에서는 localStorage 사용
        storedUser = localStorage.getItem('user');
        storedUserType = localStorage.getItem('userType');
      } else {
        // React Native에서는 AsyncStorage 사용
        storedUser = await AsyncStorage.getItem('user');
        storedUserType = await AsyncStorage.getItem('userType');
      }
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // userType이 user 객체에 있으면 그것을 사용, 없으면 별도 저장된 값 사용
        if (userData.userType) {
          setUserType(userData.userType);
        } else if (storedUserType) {
          setUserType(storedUserType as UserType);
        }
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      setUserType(userData.userType);
      
      if (Platform.OS === 'web') {
        // 웹에서는 localStorage 사용
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', userData.userType || '');
      } else {
        // React Native에서는 AsyncStorage 사용
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('userType', userData.userType || '');
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 로그아웃 시작');
      
      // 1. 로컬 상태 완전 초기화
      setUser(null);
      setUserType(null);
      
      // 2. 스토리지에서 모든 사용자 데이터 제거
      console.log('💾 모든 사용자 데이터 제거');
      if (Platform.OS === 'web') {
        // 웹에서는 localStorage 사용
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        console.log('✅ localStorage에서 모든 사용자 데이터 제거 완료');
      } else {
        // React Native에서는 AsyncStorage 사용
        await AsyncStorage.multiRemove(['user', 'userType']);
        console.log('✅ AsyncStorage에서 모든 사용자 데이터 제거 완료');
      }
      
      console.log('✅ 로그아웃 완료 (모든 데이터 정리)');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      // userType이 변경되는 경우 백엔드에 업데이트 요청
      if (userData.userType && userData.userType !== user.userType) {
        console.log('사용자 타입 업데이트:', userData.userType);
        
        // 토큰이 없으면 로컬에서만 업데이트
        if (!user.token) {
          console.log('토큰이 없어서 로컬에서만 사용자 타입 업데이트');
          const updatedUser = { ...user, ...userData };
          setUser(updatedUser);
          
          if (Platform.OS === 'web') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          }
          return;
        }
        
        const response = await userService.updateUserType(user.userId, userData.userType, user.token);
        
        if (response.success && response.user) {
          // 백엔드에서 업데이트된 사용자 정보로 로컬 상태 업데이트
          const updatedUser = { 
            ...user, 
            ...response.user, 
            id: response.user.id.toString(), // number를 string으로 변환
            userType: userData.userType 
          };
          setUser(updatedUser);
          
          if (Platform.OS === 'web') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          }
          console.log('사용자 타입이 백엔드에 성공적으로 업데이트되었습니다.');
        } else {
          throw new Error(response.message || '사용자 타입 업데이트에 실패했습니다.');
        }
      } else {
        // userType이 아닌 다른 필드 업데이트
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        
        if (Platform.OS === 'web') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    userType,
    isLoading,
    login,
    logout,
    updateUser,
    setUserType
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
