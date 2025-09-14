export interface KoBERTEmotionRequest {
  prev_user: string;
  prev_sys: string;
  curr_user: string;
}

export interface KoBERTEmotionResponse {
  predicted_label: string;
  confidence: number;
  all_probabilities: {
    상처: number;
    슬픔: number;
    불안: number;
    당황: number;
    분노: number;
    기쁨: number;
  };
}

class KoBERTApiService {
  private baseUrl = 'http://172.30.1.17:8001';

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
      console.error('KoBERT API request failed:', error);
      throw error;
    }
  }

  // KoBERT 감정 분석
  async predictEmotion(request: KoBERTEmotionRequest): Promise<KoBERTEmotionResponse> {
    try {
      const response = await this.request<KoBERTEmotionResponse>('/predict_emotion', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
    } catch (error) {
      console.error('Failed to predict emotion with KoBERT:', error);
      throw error;
    }
  }
}

export const kobertApiService = new KoBERTApiService();
export default kobertApiService;
