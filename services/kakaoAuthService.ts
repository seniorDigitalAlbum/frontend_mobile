import { API_BASE_URL, getDevServerIp } from '../config/api';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
export interface KakaoAuthResponse {
  authUrl?: string;
  loginUrl?: string;
}

export interface KakaoCallbackResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  user?: KakaoUserInfo;
  message?: string;
}

export interface KakaoUserInfoResponse {
  success: boolean;
  token?: string;
  kakaoUserInfo?: KakaoUserInfo;
  userType?: string;
  isExistingUser?: boolean;
  message?: string;
}

export interface KakaoUserInfo {
  kakaoId: number;
  nickname?: string;
  profileImageUrl?: string;
  thumbnailImageUrl?: string;
  gender?: string;
}

class KakaoAuthService {
  private baseUrl = `${API_BASE_URL}/api/auth`;

  /**
   * [웹/모바일 공용] 백엔드에서 카카오 로그인 URL을 받아오는 함수
   */
  async getKakaoAuthUrl(): Promise<string> {
    try {
      // isMobile과 clientIp를 쿼리 파라미터로 백엔드에 전달
      const params = new URLSearchParams();
      if (!isWeb) {
        params.append('isMobile', 'true');
        const clientIp = getDevServerIp();
        if (clientIp) {
          params.append('clientIp', clientIp);
        }
      }
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/kakao/login-url${queryString ? '?' + queryString : ''}`;

      console.log('백엔드에 카카오 로그인 URL 요청:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('카카오 로그인 URL을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      console.log('백엔드로부터 카카오 로그인 URL 수신:', data.loginUrl);
      return data.loginUrl;
    } catch (error) {
      console.error('getKakaoAuthUrl 에러:', error);
      throw error;
    }
  }  


  /**
   * 카카오 로그아웃
   */
  async kakaoLogout(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/kakao/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('카카오 로그아웃 실패:', error);W
      return false;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUserInfo(token: string): Promise<KakaoUserInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/kakao/user-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userInfo: KakaoUserInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  }

  /**
   * 카카오 로그인 코드로 사용자 정보 조회
   */
  async getUserInfoByCode(code: string): Promise<KakaoUserInfoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/kakao/user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: KakaoUserInfoResponse = await response.json();
      return data;
    } catch (error) {
      console.error('카카오 사용자 정보 조회 실패:', error);
      return {
        success: false,
        message: '사용자 정보 조회에 실패했습니다.'
      };
    }
  }

  /**
   * 사용자 역할 업데이트
   */
  async updateUserType(kakaoId: string, userType: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/kakao/update-user-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ kakaoId, userType })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('사용자 역할 업데이트 실패:', error);
      throw error;
    }
  }
}

export default new KakaoAuthService();
