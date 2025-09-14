import { API_BASE_URL } from '../../config/api';

export interface SpeechEmotionRequest {
  conversationMessageId: number;
  emotion: string;
  confidence: number;
  speechEmotionData: string;
}

export interface SpeechEmotionResponse {
  id: number;
  conversationMessageId: number;
  speechEmotion: string;
  speechConfidence: number;
  speechEmotionData: any;
  createdAt: string;
}

class SpeechEmotionApiService {
  private baseUrl = `${API_BASE_URL}/api/emotion-analysis`;

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
      console.error('Speech Emotion API request failed:', error);
      throw error;
    }
  }

  // 음성 감정 분석 저장
  async saveSpeechEmotion(request: SpeechEmotionRequest): Promise<SpeechEmotionResponse> {
    try {
      const response = await this.request<SpeechEmotionResponse>('/speech', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
    } catch (error) {
      console.error('Failed to save speech emotion:', error);
      throw error;
    }
  }
}

export const speechEmotionApiService = new SpeechEmotionApiService();
export default speechEmotionApiService;
