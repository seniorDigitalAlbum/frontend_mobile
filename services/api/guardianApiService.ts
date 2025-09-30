import { API_BASE_URL, apiClient } from '../../config/api';

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
      const data: SeniorInfo[] = await apiClient.post<SeniorInfo[]>('/api/guardian/search-kakao-friends', request);
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
      const data: ConnectResponse = await apiClient.post<ConnectResponse>('/api/guardian/connect-senior', request);
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
      const data: SeniorInfo[] = await apiClient.get<SeniorInfo[]>(`/api/guardian/connected-seniors/${guardianId}`);
      console.log('🧪 연결된 시니어 목록 API 응답:', data);
      return data;
    } catch (error) {
      console.error('연결된 시니어 목록 API 오류:', error);
      throw error;
    }
  },
};
