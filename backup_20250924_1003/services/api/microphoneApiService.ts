import apiClient from './apiClient';

// 마이크 세션 관련 타입 정의
export interface MicrophoneSession {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
  audioFormat: string;
  sampleRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMicrophoneSessionRequest {
  userId: string;
  audioFormat?: string;
  sampleRate?: number;
}

export interface UpdateSessionStatusRequest {
  status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
}

export interface UpdateAudioSettingsRequest {
  audioFormat?: string;
  sampleRate?: number;
}

export interface SpeechStartRequest {
  microphoneSessionId: string;
  cameraSessionId: string;
  userId: string;
}

export interface SpeechStartResponse {
  status: string;
  message: string;
  microphoneSessionId: string;
  cameraSessionId: string;
  userId: string;
  timestamp: string;
}

export interface SpeechEndRequest {
  microphoneSessionId: string;
  cameraSessionId: string;
  userId: string;
  audioData: string;
}

export interface SpeechEndWithQueryRequest {
  microphoneSessionId: string;
  cameraSessionId: string;
  userId: string;
  audioData: string;
}

export interface SpeechEndResponse {
  status: string;
  message: string;
  conversationMessageId: number;
  userText: string;
}

class MicrophoneApiService {
  private baseUrl = '/api/microphone';

  // 마이크 세션 생성
  async createSession(request: CreateMicrophoneSessionRequest): Promise<MicrophoneSession | null> {
    try {
      const params = new URLSearchParams({
        userId: request.userId,
      });

      if (request.audioFormat) {
        params.append('audioFormat', request.audioFormat);
      }
      if (request.sampleRate) {
        params.append('sampleRate', request.sampleRate.toString());
      }

      const response = await apiClient.post<{ status: string; session: MicrophoneSession; message: string }>(`${this.baseUrl}/session?${params.toString()}`);

      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to create microphone session');
      }
    } catch (error) {
      console.error('Failed to create microphone session:', error);
      return null;
    }
  }

  // 세션 정보 조회
  async getSession(sessionId: string): Promise<MicrophoneSession | null> {
    try {
      const response = await apiClient.get<{ status: string; session: MicrophoneSession }>(`${this.baseUrl}/session/${sessionId}`);
      
      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Failed to get microphone session ${sessionId}:`, error);
      return null;
    }
  }

  // 세션 상태 업데이트
  async updateSessionStatus(sessionId: string, status: string): Promise<MicrophoneSession | null> {
    try {
      const params = new URLSearchParams({ status });
      const response = await apiClient.put<{ status: string; session: MicrophoneSession; message: string }>(`${this.baseUrl}/session/${sessionId}/status?${params.toString()}`);

      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to update session status');
      }
    } catch (error) {
      console.error(`Failed to update microphone session ${sessionId} status:`, error);
      return null;
    }
  }

  // 오디오 설정 업데이트
  async updateAudioSettings(sessionId: string, request: UpdateAudioSettingsRequest): Promise<MicrophoneSession | null> {
    try {
      const params = new URLSearchParams();
      
      if (request.audioFormat) {
        params.append('audioFormat', request.audioFormat);
      }
      if (request.sampleRate) {
        params.append('sampleRate', request.sampleRate.toString());
      }

      const response = await apiClient.put<{ status: string; session: MicrophoneSession; message: string }>(`${this.baseUrl}/session/${sessionId}/settings?${params.toString()}`);

      if (response.data.status === 'success') {
        return response.data.session;
      } else {
        throw new Error(response.data.message || 'Failed to update audio settings');
      }
    } catch (error) {
      console.error(`Failed to update audio settings for session ${sessionId}:`, error);
      return null;
    }
  }

  // 세션 종료
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ status: string; message: string }>(`${this.baseUrl}/session/${sessionId}`);

      return response.data.status === 'success';
    } catch (error) {
      console.error(`Failed to end microphone session ${sessionId}:`, error);
      return false;
    }
  }

  // 사용자 세션 목록
  async getUserSessions(userId: string): Promise<MicrophoneSession[]> {
    try {
      const response = await apiClient.get<{ status: string; sessions: MicrophoneSession[]; count: number }>(`${this.baseUrl}/sessions/user/${userId}`);
      
      if (response.data.status === 'success') {
        return response.data.sessions;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Failed to get microphone sessions for user ${userId}:`, error);
      return [];
    }
  }

  // 발화 시작
  async startSpeech(request: SpeechStartRequest): Promise<SpeechStartResponse | null> {
    try {
      const response = await apiClient.post<SpeechStartResponse>(`${this.baseUrl}/speech/start`, request);

      return response.data;
    } catch (error) {
      console.error('Failed to start speech:', error);
      return null;
    }
  }

  // 발화 종료
  async endSpeech(request: SpeechEndRequest): Promise<SpeechEndResponse | null> {
    try {
      const response = await apiClient.post<SpeechEndResponse>(`${this.baseUrl}/speech/end`, request);

      return response.data;
    } catch (error) {
      console.error('Failed to end speech:', error);
      return null;
    }
  }

  // 발화 종료 (Query 파라미터 사용)
  async endSpeechWithQuery(request: SpeechEndWithQueryRequest): Promise<SpeechEndResponse | null> {
    try {
      const params = new URLSearchParams({
        microphoneSessionId: request.microphoneSessionId,
        cameraSessionId: request.cameraSessionId,
        userId: request.userId,
      });

      const response = await apiClient.post<SpeechEndResponse>(`${this.baseUrl}/speech/end?${params.toString()}`, { audioData: request.audioData });

      return response.data;
    } catch (error) {
      console.error('Failed to end speech with query:', error);
      return null;
    }
  }

  // 마이크 서비스 상태 확인
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string; message: string; timestamp: number }>(`${this.baseUrl}/health`);
      return response.data.status === 'success';
    } catch (error) {
      console.error('Microphone service health check failed:', error);
      return false;
    }
  }
}

export const microphoneApiService = new MicrophoneApiService();
export default microphoneApiService;
