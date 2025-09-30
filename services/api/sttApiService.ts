import { apiClient } from '../../config/api';

export interface STTResponse {
  text: string;
  language: string;
  confidence: number;
  duration: number;
  status: string;
  error?: string;
}

class STTApiService {
  private baseUrl = '/api/stt';

  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      console.log('STT API 응답 상태: 200');
      console.log('STT API 응답 OK: true');
      return true;
    } catch (error) {
      console.error('STT Health check failed:', error);
      return false;
    }
  }

  async transcribeAudio(audioData: string): Promise<STTResponse | null> {
    try {
      console.log('STT API 요청 시작, 오디오 데이터 길이:', audioData.length);
      
      const result = await apiClient.post(`${this.baseUrl}/transcribe`, {
        audioData: audioData
      });

      console.log('STT API 성공 응답:');
      
      return {
        text: result.text || '',
        language: result.language || 'ko',
        confidence: result.confidence || 0,
        duration: result.duration || 0,
        status: result.status || 'success'
      };
    } catch (error) {
      console.error('STT API 요청 실패:');
      return {
        text: '',
        language: 'ko',
        confidence: 0,
        duration: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async transcribeRealtime(audioData: string): Promise<STTResponse | null> {
    try {
      console.log('STT API 요청 시작, 오디오 데이터 길이:', audioData.length);
      
      // POST body로 전송 (URL 길이 제한 회피)
      const result: STTResponse = await apiClient.post(`${this.baseUrl}/realtime`, {
        audioData: audioData
      });

      console.log('STT API 성공 응답');
      return result;
    } catch (error) {
      console.error('STT API request failed:', error);
      return {
        text: '',
        language: 'ko',
        confidence: 0,
        duration: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new STTApiService();
