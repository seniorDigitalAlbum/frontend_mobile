import { API_BASE_URL } from '../../config/api';

export interface ConversationContextRequest {
  conversationMessageId: number;
}

export interface ConversationContextResponse {
  success: boolean;
  conversationId: number;
  conversationMessageId: number;
  prevUser: string;
  prevSys: string;
  currUser: string;
}

class ConversationContextApiService {
  private baseUrl = `${API_BASE_URL}/api/conversations`;

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
      console.error('Conversation Context API request failed:', error);
      throw error;
    }
  }

  // 대화 컨텍스트 조회
  async getContext(conversationMessageId: number): Promise<ConversationContextResponse> {
    try {
      const response = await this.request<ConversationContextResponse>(`/context/${conversationMessageId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Failed to get conversation context:', error);
      throw error;
    }
  }
}

export const conversationContextApiService = new ConversationContextApiService();
export default conversationContextApiService;
