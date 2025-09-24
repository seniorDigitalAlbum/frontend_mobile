import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface SeniorInfo {
  id: number;
  name: string;
  kakaoNickname?: string;
  kakaoProfileImage?: string;
}

interface SearchFriendsResponse {
  success: boolean;
  seniors: SeniorInfo[];
  totalCount: number;
}

interface ConnectResponse {
  success: boolean;
  message?: string;
}

class GuardianService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL
  });

  async searchKakaoFriends(token: string): Promise<SearchFriendsResponse> {
    try {
      const response = await this.apiClient.post<SearchFriendsResponse>(
        '/api/login/kakao/search-friends',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('카카오 친구 중 시니어 검색 실패:', error);
      // 에러를 그대로 상위로 전달하여 컴포넌트에서 처리하도록 함
      throw error;
    }
  }

  async connectSenior(guardianId: number, seniorId: number): Promise<ConnectResponse> {
    try {
      const response = await this.apiClient.post<ConnectResponse>('/api/guardians/connect', {
        guardianId,
        seniorId,
      });
      return response.data;
    } catch (error) {
      console.error('시니어 연결 실패:', error);
      throw error;
    }
  }
}

export default new GuardianService();