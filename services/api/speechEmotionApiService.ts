import { apiClient } from '../../config/api';

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
  // 음성 감정 분석 저장
  async saveSpeechEmotion(request: SpeechEmotionRequest): Promise<SpeechEmotionResponse> {
    try {
      const response = await apiClient.post<SpeechEmotionResponse>('/api/emotion-analysis/speech', request);
      return response;
    } catch (error) {
      console.error('Failed to save speech emotion:', error);
      throw error;
    }
  }
}

export const speechEmotionApiService = new SpeechEmotionApiService();
export default speechEmotionApiService;
