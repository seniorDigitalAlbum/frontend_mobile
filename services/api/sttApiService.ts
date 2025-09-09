import { API_BASE_URL } from '../../config/api';

export interface STTResponse {
  text: string;
  language: string;
  confidence: number;
  duration: number;
  status: string;
  error?: string;
}

class STTApiService {
  private baseUrl = `${API_BASE_URL}/api/stt`;

  async checkHealth(): Promise<boolean> {
    try {
      console.log('STT API 헬스체크 요청:', `${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('STT API 응답 상태:', response.status);
      console.log('STT API 응답 OK:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('STT Health check failed:', error);
      return false;
    }
  }

  async transcribeRealtime(audioData: string): Promise<STTResponse | null> {
    try {
      console.log('STT API 요청 시작, 오디오 데이터 길이:', audioData.length);
      
      // POST body로 전송 (FormData 사용)
      const formData = new FormData();
      formData.append('audioData', audioData);
      
      const response = await fetch(`${this.baseUrl}/realtime`, {
        method: 'POST',
        body: formData,
      });

      console.log('STT API 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('STT API 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: STTResponse = await response.json();
      console.log('STT API 성공 응답:', result);
      return result;
    } catch (error) {
      console.error('STT API request failed:', error);
      return null;
    }
  }
}

export default new STTApiService();
