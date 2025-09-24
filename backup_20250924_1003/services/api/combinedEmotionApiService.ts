import apiClient from './apiClient';

export interface CombinedEmotionRequest {
  conversationMessageId: number;
}

export interface CombinedEmotionResponse {
  id: number;
  conversationMessageId: number;
  facialEmotion: string;
  facialConfidence: number;
  speechEmotion: string;
  speechConfidence: number;
  combinedEmotion: string;
  combinedConfidence: number;
  createdAt: string;
}

class CombinedEmotionApiService {
  private baseUrl = '/api/emotion-analysis';

  // 통합 감정 분석
  async combineEmotions(request: CombinedEmotionRequest): Promise<CombinedEmotionResponse> {
    try {
      console.log('🔄 통합 감정 분석 요청:', request);
      const response = await apiClient.post<CombinedEmotionResponse>(`${this.baseUrl}/combine`, request);

      console.log('✅ 통합 감정 분석 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 통합 감정 분석 실패:', error);
      throw error;
    }
  }
}

export const combinedEmotionApiService = new CombinedEmotionApiService();
export default combinedEmotionApiService;
