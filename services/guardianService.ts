import { API_BASE_URL } from '../config/api';

export interface SeniorInfo {
  id: number;
  name: string;
  profileImage?: string;
  kakaoId?: string;
  kakaoNickname?: string;
  kakaoProfileImage?: string;
}

export interface ConnectResponse {
  success: boolean;
  message: string;
}

class GuardianService {
  private baseUrl = `${API_BASE_URL}/api/guardian`;

  /**
   * 카카오 친구 중 시니어 검색 (JWT 토큰 사용)
   */
  async searchKakaoFriends(jwtToken: string): Promise<SeniorInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/kakao/search-friends`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.seniors || [];
      } else {
        throw new Error(data.message || '친구 검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 친구 중 시니어 검색 실패:', error);
      return [];
    }
  }

  /**
   * 시니어와 연결
   */
  async connectSenior(guardianId: number, seniorId: number): Promise<ConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/connect-senior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guardianId, seniorId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ConnectResponse = await response.json();
      return result;
    } catch (error) {
      console.error('시니어 연결 실패:', error);
      return {
        success: false,
        message: '연결에 실패했습니다.'
      };
    }
  }

  /**
   * 연결된 시니어 목록 조회
   */
  async getConnectedSeniors(guardianId: number): Promise<SeniorInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/connected-seniors/${guardianId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const seniors: SeniorInfo[] = await response.json();
      return seniors;
    } catch (error) {
      console.error('연결된 시니어 목록 조회 실패:', error);
      return [];
    }
  }
}

export default new GuardianService();
