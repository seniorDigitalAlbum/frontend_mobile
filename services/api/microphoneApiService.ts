import { API_BASE_URL } from '../../config/api';

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
  conversationId: number;
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
  aiResponse: string;
  audioBase64: string;
}

class MicrophoneApiService {
  private baseUrl = `${API_BASE_URL}/api/microphone`;

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
      console.error('Microphone API request failed:', error);
      throw error;
    }
  }

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

      const response = await this.request<{ status: string; session: MicrophoneSession; message: string }>(`/session?${params.toString()}`, {
        method: 'POST',
      });

      if (response.status === 'success') {
        return response.session;
      } else {
        throw new Error(response.message || 'Failed to create microphone session');
      }
    } catch (error) {
      console.error('Failed to create microphone session:', error);
      return null;
    }
  }

  // 세션 정보 조회
  async getSession(sessionId: string): Promise<MicrophoneSession | null> {
    try {
      const response = await this.request<{ status: string; session: MicrophoneSession }>(`/session/${sessionId}`);
      
      if (response.status === 'success') {
        return response.session;
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
      const response = await this.request<{ status: string; session: MicrophoneSession; message: string }>(`/session/${sessionId}/status?${params.toString()}`, {
        method: 'PUT',
      });

      if (response.status === 'success') {
        return response.session;
      } else {
        throw new Error(response.message || 'Failed to update session status');
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

      const response = await this.request<{ status: string; session: MicrophoneSession; message: string }>(`/session/${sessionId}/settings?${params.toString()}`, {
        method: 'PUT',
      });

      if (response.status === 'success') {
        return response.session;
      } else {
        throw new Error(response.message || 'Failed to update audio settings');
      }
    } catch (error) {
      console.error(`Failed to update audio settings for session ${sessionId}:`, error);
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
      console.error(`Failed to end microphone session ${sessionId}:`, error);
      return false;
    }
  }

  // 사용자 세션 목록
  async getUserSessions(userId: string): Promise<MicrophoneSession[]> {
    try {
      const response = await this.request<{ status: string; sessions: MicrophoneSession[]; count: number }>(`/sessions/user/${userId}`);
      
      if (response.status === 'success') {
        return response.sessions;
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
      const response = await this.request<SpeechStartResponse>('/speech/start', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
    } catch (error) {
      console.error('Failed to start speech:', error);
      return null;
    }
  }

  // 발화 종료
  async endSpeech(request: SpeechEndRequest): Promise<SpeechEndResponse | null> {
    try {
      const response = await this.request<SpeechEndResponse>('/speech/end', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
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

      const response = await this.request<SpeechEndResponse>(`/speech/end?${params.toString()}`, {
        method: 'POST',
        body: JSON.stringify({ audioData: request.audioData }),
      });

      return response;
    } catch (error) {
      console.error('Failed to end speech with query:', error);
      return null;
    }
  }

  // 마이크 서비스 상태 확인
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string; message: string; timestamp: number }>('/health');
      return response.status === 'success';
    } catch (error) {
      console.error('Microphone service health check failed:', error);
      return false;
    }
  }
}

export const microphoneApiService = new MicrophoneApiService();
export default microphoneApiService;
