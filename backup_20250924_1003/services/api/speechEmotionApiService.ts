import apiClient from './apiClient';

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
  private baseUrl = '/api/emotion-analysis';

  // 음성 감정 분석 저장
  async saveSpeechEmotion(request: SpeechEmotionRequest): Promise<SpeechEmotionResponse> {
    try {
      const response = await apiClient.post<SpeechEmotionResponse>(`${this.baseUrl}/speech`, request);

      return response.data;
    } catch (error) {
      console.error('Failed to save speech emotion:', error);
      throw error;
    }
  }
}

export const speechEmotionApiService = new SpeechEmotionApiService();
export default speechEmotionApiService;
