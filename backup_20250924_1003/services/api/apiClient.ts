// src/services/api/apiClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';
import { navigationRef } from '../../App';

// 401에서 서버 호출을 또 하면 순환될 수 있어, 여기서는 **로컬 정리 + 화면 리셋만** 수행
async function handleUnauthorized() {
  try {
    await AsyncStorage.removeItem('user');
  } finally {
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (config) => {
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await handleUnauthorized(); // ✅ 자동 로그아웃 처리
    }
    return Promise.reject(error);
  }
);

export default apiClient;
