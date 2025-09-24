import { getKoBERTApiUrl } from '../../config/api';
import axios from 'axios';

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
  private baseUrl = getKoBERTApiUrl();

  // KoBERT 감정 분석
  async predictEmotion(request: KoBERTEmotionRequest): Promise<KoBERTEmotionResponse> {
    try {
      const response = await axios.post<KoBERTEmotionResponse>(`${this.baseUrl}/predict_emotion`, request);

      return response.data;
    } catch (error) {
      console.error('Failed to predict emotion with KoBERT:', error);
      throw error;
    }
  }
}

export const kobertApiService = new KoBERTApiService();
export default kobertApiService;
