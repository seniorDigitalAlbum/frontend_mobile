import { API_BASE_URL, apiClient } from '../../config/api';

export interface User {
  id: number;
  kakaoId: string;
  nickname: string;
  profileImageUrl?: string;
  gender?: string;
  phoneNumber?: string;
  userType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
}

class UserService {
  private baseUrl = API_BASE_URL;

  /**
   * 사용자 ID로 사용자 정보 조회
   */
  async getUserById(userId: string, token?: string): Promise<UserResponse> {
    try {
      console.log('사용자 정보 조회 API 호출:', `/api/users/${userId}`);
      
      let user: User;
      if (token) {
        // 토큰이 직접 전달된 경우, 직접 fetch 사용
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        user = await response.json();
      } else {
        // 토큰이 없는 경우 apiClient 사용 (스토리지에서 토큰 가져옴)
        user = await apiClient.get<User>(`/api/users/${userId}`);
      }
      
      console.log('사용자 정보 조회 성공:', user);
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '사용자 정보를 가져올 수 없습니다.'
      };
    }
  }

  /**
   * 사용자 타입 업데이트
   */
  async updateUserType(userId: string, userType: string, token?: string): Promise<UserResponse> {
    try {
      console.log('사용자 타입 업데이트 API 호출:', `/api/users/${userId}/user-type`);
      
      const user: User = await apiClient.put<User>(`/api/users/${userId}/user-type`, {
        userType: userType
      });
      console.log('사용자 타입 업데이트 성공:', user);
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('사용자 타입 업데이트 실패:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '사용자 타입을 업데이트할 수 없습니다.'
      };
    }
  }
}

export const userService = new UserService();
