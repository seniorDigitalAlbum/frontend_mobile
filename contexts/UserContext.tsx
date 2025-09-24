// contexts/UserContext.tsx
import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logoutService from '../services/logoutService';

export enum UserType {
  SENIOR = 'SENIOR',
  GUARDIAN = 'GUARDIAN',
}

export interface User {
  id: string;
  userId: string;
  name: string;
  phone: string;
  userType: UserType;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
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
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.userType) setUserType(parsedUser.userType);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    setUser(userData);
    setUserType(userData.userType);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await logoutService.logout(); // 서버 블랙리스트 + 로컬 정리(부분)
    } finally {
      setUser(null);
      setUserType(null);
      await AsyncStorage.removeItem('user');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleSetUserType = (type: UserType) => {
    if (user) updateUser({ ...user, userType: type });
  };

  const value: UserContextType = { user, userType, isLoading, login, logout, updateUser, setUserType: handleSetUserType };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
}
