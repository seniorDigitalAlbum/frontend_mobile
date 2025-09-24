// src/services/logoutService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

async function getAccessToken(): Promise<string | null> {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) return null;
  try {
    const u = JSON.parse(userStr);
    return u?.token ?? null;
  } catch {
    return null;
  }
}

// 로컬만 정리(인터셉터 401 케이스 등에서 사용)
export async function softLogoutLocalOnly() {
  await AsyncStorage.removeItem('user');
}

async function logout() {
  const token = await getAccessToken();
  if (!token) {
    await softLogoutLocalOnly();
    return;
  }
  // apiClient를 쓰면 401 인터셉터 루프 가능성 → fetch로 직접 호출
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // 서버는 바디 없이도 OK
    });
  } catch {
    // 네트워크 실패여도 클라이언트는 정리
  } finally {
    await softLogoutLocalOnly();
  }
}

export default { logout, softLogoutLocalOnly };
