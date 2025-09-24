import { API_BASE_URL } from '../../config/api';

export interface SeniorInfo {
  id: number;
  name: string;
  profileImage?: string;
  kakaoId?: string;
  kakaoNickname?: string;
  kakaoProfileImage?: string;
}

export interface SearchKakaoFriendsRequest {
  accessToken: string;
}

export interface ConnectSeniorRequest {
  guardianId: number;
  seniorId: number;
}

export interface ConnectResponse {
  success: boolean;
  message: string;
}

export const guardianApiService = {
  // 카카오 친구 중 시니어 검색
  searchKakaoFriends: async (request: SearchKakaoFriendsRequest): Promise<SeniorInfo[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guardian/search-kakao-friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SeniorInfo[] = await response.json();
      console.log('🧪 카카오 친구 중 시니어 검색 API 응답:', data);
      return data;
    } catch (error) {
      console.error('카카오 친구 중 시니어 검색 API 오류:', error);
      throw error;
    }
  },

  // 시니어와 연결
  connectSenior: async (request: ConnectSeniorRequest): Promise<ConnectResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guardian/connect-senior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ConnectResponse = await response.json();
      console.log('🧪 시니어 연결 API 응답:', data);
      return data;
    } catch (error) {
      console.error('시니어 연결 API 오류:', error);
      throw error;
    }
  },

  // 연결된 시니어 목록 조회
  getConnectedSeniors: async (guardianId: number): Promise<SeniorInfo[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guardian/connected-seniors/${guardianId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SeniorInfo[] = await response.json();
      console.log('🧪 연결된 시니어 목록 API 응답:', data);
      return data;
    } catch (error) {
      console.error('연결된 시니어 목록 API 오류:', error);
      throw error;
    }
  },
};
