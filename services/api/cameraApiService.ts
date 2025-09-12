import { API_BASE_URL } from '../../config/api';

// 카메라 세션 관련 타입 정의
export interface CameraSession {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCameraSessionRequest {
  userId: string;
}

export interface UpdateSessionStatusRequest {
  status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
}

class CameraApiService {
  private baseUrl = `${API_BASE_URL}/api/camera`;

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Camera API request failed:', error);
      throw error;
    }
  }

  // 카메라 세션 생성
  async createSession(request: CreateCameraSessionRequest): Promise<CameraSession | null> {
    try {
      const params = new URLSearchParams({
        userId: request.userId,
      });

      const response = await this.request<{ status: string; session: CameraSession; message: string }>(`/session?${params.toString()}`, {
        method: 'POST',
      });

      if (response.status === 'success') {
        return response.session;
      } else {
        throw new Error(response.message || 'Failed to create camera session');
      }
    } catch (error) {
      console.error('Failed to create camera session:', error);
      return null;
    }
  }

  // 세션 정보 조회
  async getSession(sessionId: string): Promise<CameraSession | null> {
    try {
      const response = await this.request<{ status: string; session: CameraSession }>(`/session/${sessionId}`);
      
      if (response.status === 'success') {
        return response.session;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Failed to get camera session ${sessionId}:`, error);
      return null;
    }
  }

  // 세션 상태 업데이트
  async updateSessionStatus(sessionId: string, status: string): Promise<CameraSession | null> {
    try {
      const params = new URLSearchParams({ status });
      const response = await this.request<{ status: string; session: CameraSession; message: string }>(`/session/${sessionId}/status?${params.toString()}`, {
        method: 'PUT',
      });

      if (response.status === 'success') {
        return response.session;
      } else {
        throw new Error(response.message || 'Failed to update session status');
      }
    } catch (error) {
      console.error(`Failed to update camera session ${sessionId} status:`, error);
      return null;
    }
  }

  // 세션 종료
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.request<{ status: string; message: string }>(`/session/${sessionId}`, {
        method: 'DELETE',
      });

      return response.status === 'success';
    } catch (error) {
      console.error(`Failed to end camera session ${sessionId}:`, error);
      return false;
    }
  }

  // 사용자 세션 목록
  async getUserSessions(userId: string): Promise<CameraSession[]> {
    try {
      const response = await this.request<{ status: string; sessions: CameraSession[]; count: number }>(`/sessions/user/${userId}`);
      
      if (response.status === 'success') {
        return response.sessions;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Failed to get camera sessions for user ${userId}:`, error);
      return [];
    }
  }

  // 카메라 서비스 상태 확인
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string; message: string; timestamp: number }>('/health');
      return response.status === 'success';
    } catch (error) {
      console.error('Camera service health check failed:', error);
      return false;
    }
  }
}

export const cameraApiService = new CameraApiService();
export default cameraApiService;
