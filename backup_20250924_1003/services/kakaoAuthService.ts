import { API_BASE_URL } from '../config/api';
import { Platform } from 'react-native';
import apiClient from './api/apiClient';

export interface KakaoAuthResponse {
  authUrl: string;
}

class KakaoAuthService {
  private baseUrl = '/api/login';

  private async getCurrentDeviceIP(): Promise<string | null> {
    try {
      const url = new URL(API_BASE_URL);
      return url.hostname;
    } catch (error) {
      console.error('IP 주소 추출 실패:', error);
      return null;
    }
  }

  async getKakaoAuthUrl(scope?: string): Promise<string> {
    try {
      const platform = Platform.OS;
      let url = `/kakao?platform=${platform}`;

      if (scope) {
        url += `&scope=${scope}`;
      }
      
      if (Platform.OS !== 'web') {
        const ip = await this.getCurrentDeviceIP();
        if (ip) {
          url += `&ip=${ip}`;
        }
      }
      
      const response = await apiClient.get<KakaoAuthResponse>(`${this.baseUrl}${url}`);
      return response.data.authUrl;
    } catch (error) {
      console.error('카카오 로그인 URL 가져오기 실패:', error);
      throw new Error('카카오 로그인 URL을 가져올 수 없습니다.');
    }
  }
}

export default new KakaoAuthService();