import apiClient from './apiClient';

export interface GPTGenerateRequest {
  conversationMessageId: number;
}

export interface GPTGenerateResponse {
  aiResponse: string;
  emotionInfo: string;
  conversationMessageId: number;
  savedAIMessageId: number;
}

class GPTApiService {
  private baseUrl = '/api/gpt';

  // GPT 답변 생성
  async generateResponse(request: GPTGenerateRequest): Promise<GPTGenerateResponse> {
    try {
      const response = await apiClient.post<GPTGenerateResponse>(`${this.baseUrl}/generate`, request);

      return response.data;
    } catch (error) {
      console.error('Failed to generate GPT response:', error);
      throw error;
    }
  }

  // GPT 서비스 상태 확인
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string; message: string }>(`${this.baseUrl}/health`);
      return response.data.status === 'success';
    } catch (error) {
      console.error('GPT service health check failed:', error);
      return false;
    }
  }
}

export const gptApiService = new GPTApiService();
export default gptApiService;
