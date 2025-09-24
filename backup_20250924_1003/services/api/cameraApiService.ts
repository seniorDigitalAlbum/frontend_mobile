import apiClient from './apiClient';

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
  private baseUrl = '/api/camera';

  // 카메라 세션 생성
  async createSession(request: CreateCameraSessionRequest): Promise<CameraSession | null> {
    try {
      const params = new URLSearchParams({
        userId: request.userId,
      });

      const response = await apiClient.post<{ status: string; session: CameraSession; message: string }>(`${this.baseUrl}/session?${params.toString()}`);

      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to create camera session');
      }
    } catch (error) {
      console.error('Failed to create camera session:', error);
      return null;
    }
  }

  // 세션 정보 조회
  async getSession(sessionId: string): Promise<CameraSession | null> {
    try {
      const response = await apiClient.get<{ status: string; session: CameraSession }>(`${this.baseUrl}/session/${sessionId}`);
      
      if (response.data.status === 'success') {
        return response.data.session;
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
      const response = await apiClient.put<{ status: string; session: CameraSession; message: string }>(`${this.baseUrl}/session/${sessionId}/status?${params.toString()}`);

      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to update session status');
      }
    } catch (error) {
      console.error(`Failed to update camera session ${sessionId} status:`, error);
      return null;
    }
  }

  // 세션 종료
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ status: string; message: string }>(`${this.baseUrl}/session/${sessionId}`);

      return response.data.status === 'success';
    } catch (error) {
      console.error(`Failed to end camera session ${sessionId}:`, error);
      return false;
    }
  }

  // 사용자 세션 목록
  async getUserSessions(userId: string): Promise<CameraSession[]> {
    try {
      const response = await apiClient.get<{ status: string; sessions: CameraSession[]; count: number }>(`${this.baseUrl}/sessions/user/${userId}`);
      
      if (response.data.status === 'success') {
        return response.data.sessions;
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
      const response = await apiClient.get<{ status: string; message: string; timestamp: number }>(`${this.baseUrl}/health`);
      return response.data.status === 'success';
    } catch (error) {
      console.error('Camera service health check failed:', error);
      return false;
    }
  }
}

export const cameraApiService = new CameraApiService();
export default cameraApiService;
