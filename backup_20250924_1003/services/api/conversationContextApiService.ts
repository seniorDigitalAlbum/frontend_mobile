import apiClient from './apiClient';

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
  private baseUrl = '/api/conversations';

  // 대화 컨텍스트 조회
  async getContext(conversationMessageId: number): Promise<ConversationContextResponse> {
    try {
      const response = await apiClient.get<ConversationContextResponse>(`${this.baseUrl}/context/${conversationMessageId}`);

      return response.data;
    } catch (error) {
      console.error('Failed to get conversation context:', error);
      throw error;
    }
  }
}

export const conversationContextApiService = new ConversationContextApiService();
export default conversationContextApiService;
