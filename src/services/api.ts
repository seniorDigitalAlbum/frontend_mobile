import axios from 'axios';

// 개발 환경에서는 로컬 IP 주소를 사용
// 실제 배포 시에는 실제 서버 URL로 변경
const API_BASE_URL = 'http://172.30.1.98:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

export const apiService = {
  // 헬스 체크
  healthCheck: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // 테스트 API 호출
  test: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/test');
      return response.data;
    } catch (error) {
      console.error('Test API failed:', error);
      throw error;
    }
  },

  // 데이터 전송
  sendData: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/data', data);
      return response.data;
    } catch (error) {
      console.error('Send data failed:', error);
      throw error;
    }
  },
};

export default api; 