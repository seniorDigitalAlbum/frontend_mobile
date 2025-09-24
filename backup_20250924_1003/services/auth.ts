// src/services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api/apiClient';
import { navigationRef } from '../App';

export async function softLogoutLocalOnly() {
  await AsyncStorage.removeItem('user');
}

export async function logout() {
  try {
    const userStr = await AsyncStorage.getItem('user');
    const token = userStr ? JSON.parse(userStr)?.token : null;
    if (token) {
      await apiClient.post('/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    }
  } catch (e) {
    // 서버/네트워크 에러여도 계속 진행
  }
  await softLogoutLocalOnly();
  navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
}
