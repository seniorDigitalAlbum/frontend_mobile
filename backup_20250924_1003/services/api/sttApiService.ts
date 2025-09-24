import apiClient from './apiClient';

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
      console.log('STT API 헬스체크 요청:', `${this.baseUrl}/health`);
      const response = await apiClient.get(`${this.baseUrl}/health`);
      console.log('STT API 응답 상태:', response.status);
      return true;
    } catch (error) {
      console.error('STT Health check failed:', error);
      return false;
    }
  }

  async transcribeAudio(audioData: string): Promise<STTResponse | null> {
    try {
      console.log('STT API 요청 시작, 오디오 데이터 길이:', audioData.length);
      
      const response = await apiClient.post(`${this.baseUrl}/transcribe`, {
        audioData: audioData
      });

      console.log('STT API 응답 상태:', response.status);
      
      const result = response.data;
      console.log('STT API 성공 응답:', result);
      
      return {
        text: result.text || '',
        language: result.language || 'ko',
        confidence: result.confidence || 0,
        duration: result.duration || 0,
        status: result.status || 'success'
      };
    } catch (error) {
      console.error('STT API 요청 실패:', error);
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
