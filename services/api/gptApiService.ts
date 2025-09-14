import { API_BASE_URL } from '../../config/api';

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
  private baseUrl = `${API_BASE_URL}/api/gpt`;

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
      console.error('GPT API request failed:', error);
      throw error;
    }
  }

  // GPT 답변 생성
  async generateResponse(request: GPTGenerateRequest): Promise<GPTGenerateResponse> {
    try {
      const response = await this.request<GPTGenerateResponse>('/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
    } catch (error) {
      console.error('Failed to generate GPT response:', error);
      throw error;
    }
  }

  // GPT 서비스 상태 확인
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string; message: string }>('/health');
      return response.status === 'success';
    } catch (error) {
      console.error('GPT service health check failed:', error);
      return false;
    }
  }
}

export const gptApiService = new GPTApiService();
export default gptApiService;
