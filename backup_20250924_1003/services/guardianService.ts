// src/services/guardianService.ts
import apiClient from './api/apiClient';

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
  async searchKakaoFriends(): Promise<SearchFriendsResponse> {
    const response = await apiClient.post<SearchFriendsResponse>('/api/login/kakao/search-friends');
    return response.data;
  }

  async connectSenior(guardianId: number, seniorId: number): Promise<ConnectResponse> {
    const response = await apiClient.post<ConnectResponse>('/api/guardians/connect', {
      guardianId,
      seniorId,
    });
    return response.data;
  }
}

export default new GuardianService();
