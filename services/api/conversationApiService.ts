import { API_BASE_URL } from '../../config/api';

// 대화 관련 타입 정의
export interface Conversation {
  id: number;
  userId: string;
  questionId: number;
  cameraSessionId: string;
  microphoneSessionId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: number;
  conversationId: number;
  senderType: 'USER' | 'AI';
  content: string;
  timestamp: string;
  emotionAnalysis?: any;
}

export interface ConversationContextResponse {
  success: boolean;
  context?: string;
  error?: string;
}

export interface CreateConversationRequest {
  userId: string;
  questionId: number;
  cameraSessionId: string;
  microphoneSessionId: string;
}

export interface StartConversationRequest {
  userId: string;
  questionId: number;
}

export interface StartConversationResponse {
  conversationId: number;
  cameraSessionId: string;
  microphoneSessionId: string;
  status: string;
  question: {
    id: number;
    content: string;
  };
  message: string;
}

export interface ProcessingStatusResponse {
  status: string;
  message: string;
  isProcessing: boolean;
  progress: number;
  estimatedTimeRemaining?: number;
}

export interface DiaryResponse {
  conversationId: number;
  summary: string;
  diary: string;
  emotionSummary: {
    dominantEmotion: string;
    averageConfidence: number;
    analyzedMessageCount: number;
    emotionCounts: Record<string, number>;
  };
  musicRecommendations: Array<{
    id: number;
    title: string;
    artist: string;
    mood: string;
    youtubeLink: string;
    youtubeVideoId: string;
  }>;
  message: string;
}

export interface SaveMessageRequest {
  content: string;
}

class ConversationApiService {
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
      console.error('Conversation API request failed:', error);
      throw error;
    }
  }

  // 대화 세션 시작
  async startConversation(request: StartConversationRequest): Promise<StartConversationResponse> {
    try {
      const response = await this.request<StartConversationResponse>('/start', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  // 대화 세션 생성
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    try {
      const params = new URLSearchParams({
        userId: request.userId,
        questionId: request.questionId.toString(),
        cameraSessionId: request.cameraSessionId,
        microphoneSessionId: request.microphoneSessionId,
      });

      const response = await this.request<Conversation>(`?${params.toString()}`, {
        method: 'POST',
      });

      return response;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  // 대화 세션 조회
  async getConversation(conversationId: number): Promise<Conversation | null> {
    try {
      const response = await this.request<Conversation>(`/${conversationId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 사용자별 대화 세션 목록
  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    try {
      const response = await this.request<Conversation[]>(`/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversations for user ${userId}:`, error);
      return [];
    }
  }

  // 사용자의 활성 대화 세션
  async getActiveConversation(userId: string): Promise<Conversation | null> {
    try {
      const response = await this.request<Conversation>(`/user/${userId}/active`);
      return response;
    } catch (error) {
      console.error(`Failed to get active conversation for user ${userId}:`, error);
      return null;
    }
  }

  // 질문별 대화 세션 목록
  async getConversationsByQuestion(questionId: number): Promise<Conversation[]> {
    try {
      const response = await this.request<Conversation[]>(`/question/${questionId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversations for question ${questionId}:`, error);
      return [];
    }
  }

  // 대화 세션 상태 업데이트
  async updateConversationStatus(
    conversationId: number, 
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Conversation | null> {
    try {
      const params = new URLSearchParams({ status });
      const response = await this.request<Conversation>(`/${conversationId}/status?${params.toString()}`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error(`Failed to update conversation ${conversationId} status:`, error);
      return null;
    }
  }

  // 대화 세션 종료
  async endConversation(conversationId: number): Promise<{
    conversationId: number;
    status: string;
    processingStatus: string;
    messages: Array<{
      id: number;
      content: string;
      senderType: string;
      createdAt: string;
    }>;
    message: string;
  } | null> {
    try {
      const response = await this.request<{
        conversationId: number;
        status: string;
        processingStatus: string;
        messages: Array<{
          id: number;
          content: string;
          senderType: string;
          createdAt: string;
        }>;
        message: string;
      }>(`/${conversationId}/end`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error(`Failed to end conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 대화 처리 상태 확인
  async getProcessingStatus(conversationId: number): Promise<ProcessingStatusResponse | null> {
    try {
      const response = await this.request<ProcessingStatusResponse>(`/${conversationId}/processing-status`);
      return response;
    } catch (error) {
      console.error(`Failed to get processing status for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 생성된 일기 조회
  async getDiary(conversationId: number): Promise<DiaryResponse | null> {
    try {
      const response = await this.request<DiaryResponse>(`/${conversationId}/diary`);
      return response;
    } catch (error) {
      console.error(`Failed to get diary for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 대화 메시지 목록 조회
  async getConversationMessages(conversationId: number): Promise<ConversationMessage[]> {
    try {
      const response = await this.request<ConversationMessage[]>(`/${conversationId}/messages`);
      return response;
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  // 사용자 메시지 저장
  async saveUserMessage(conversationId: number, content: string): Promise<ConversationMessage | null> {
    try {
      const params = new URLSearchParams({ content });
      const response = await this.request<ConversationMessage>(`/${conversationId}/messages/user?${params.toString()}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error(`Failed to save user message for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // AI 메시지 저장
  async saveAIMessage(conversationId: number, content: string): Promise<ConversationMessage | null> {
    try {
      const params = new URLSearchParams({ content });
      const response = await this.request<ConversationMessage>(`/${conversationId}/messages/ai?${params.toString()}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error(`Failed to save AI message for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 더미 대화 데이터 생성 (테스트용)
  async createDummyConversations(userId: string): Promise<string> {
    try {
      const response = await this.request<string>(`/dummy/${userId}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error(`Failed to create dummy conversations for user ${userId}:`, error);
      throw error;
    }
  }

  // 대화 컨텍스트 조회
  async getConversationContext(conversationMessageId: number): Promise<ConversationContextResponse> {
    try {
      const response = await this.request<ConversationContextResponse>(`/context/${conversationMessageId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversation context for message ${conversationMessageId}:`, error);
      return {
        success: false,
        error: 'Failed to get conversation context',
      };
    }
  }

  // 대화 서비스 상태 확인
  async healthCheck(): Promise<string> {
    try {
      const response = await this.request<string>('/health');
      return response;
    } catch (error) {
      console.error('Conversation service health check failed:', error);
      throw error;
    }
  }
}

export const conversationApiService = new ConversationApiService();
export default conversationApiService;
