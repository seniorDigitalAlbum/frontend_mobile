import { apiClient } from '../../config/api';

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
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      console.log('🔄 ConversationContextApiService.request 호출:', endpoint);
      const result = await apiClient.request<T>(`/api/conversations${endpoint}`, options);
      console.log('✅ ConversationContextApiService.request 성공:', endpoint);
      return result;
    } catch (error) {
      console.error('❌ Conversation Context API request failed:', error);
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
