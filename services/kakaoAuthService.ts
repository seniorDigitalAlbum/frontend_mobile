import { API_BASE_URL } from '../config/api';
import { Platform } from 'react-native';

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
  public baseUrl = `${API_BASE_URL}/api/auth`;

  /**
   * 현재 기기의 IP 주소 가져오기 (Expo Go용)
   */
  private async getCurrentDeviceIP(): Promise<string | null> {
    try {
      // API_BASE_URL에서 IP 추출 (예: http://192.168.1.100:8080 -> 192.168.1.100)
      const url = new URL(API_BASE_URL);
      return url.hostname;
    } catch (error) {
      console.error('IP 주소 추출 실패:', error);
      return null;
    }
  }

  /**
   * 카카오 로그인 URL 가져오기
   */
  async getKakaoAuthUrl(): Promise<string> {
    try {
      const url = `${this.baseUrl}/kakao/login-url`;
      console.log('카카오 로그인 URL 요청:', url);
      
      const response = await fetch(url);
      console.log('카카오 로그인 URL 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('카카오 로그인 URL 요청 실패:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data: any = await response.json();
      console.log('카카오 로그인 URL 응답 데이터:', data);
      
      // 백엔드에서 loginUrl로 응답하므로 이를 사용
      const authUrl = data.loginUrl || data.authUrl;
      
      if (!authUrl) {
        console.error('응답에 loginUrl 또는 authUrl이 없음:', data);
        throw new Error('응답에 로그인 URL이 없습니다.');
      }
      
      return authUrl;
    } catch (error) {
      console.error('카카오 로그인 URL 가져오기 실패:', error);
      throw new Error('카카오 로그인 URL을 가져올 수 없습니다.');
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
      console.error('카카오 로그아웃 실패:', error);
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
