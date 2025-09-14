import { API_BASE_URL } from '../../config/api';

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
        const errorText = await response.text();
        console.error('Combined Emotion API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Combined Emotion API request failed:', error);
      throw error;
    }
  }

  // 통합 감정 분석
  async combineEmotions(request: CombinedEmotionRequest): Promise<CombinedEmotionResponse> {
    try {
      console.log('🔄 통합 감정 분석 요청:', request);
      const response = await this.request<CombinedEmotionResponse>('/combine', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      console.log('✅ 통합 감정 분석 응답:', response);
      return response;
    } catch (error) {
      console.error('❌ 통합 감정 분석 실패:', error);
      throw error;
    }
  }
}

export const combinedEmotionApiService = new CombinedEmotionApiService();
export default combinedEmotionApiService;
