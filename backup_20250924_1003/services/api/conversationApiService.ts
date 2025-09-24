import apiClient from './apiClient';

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
  diary: string;
  musicRecommendations: Array<{
    id: number;
    title: string;
    artist: string;
    mood: string;
    youtubeLink: string;
    youtubeVideoId: string;
  }>;
  message: string;
  success: boolean;
}

export interface SaveMessageRequest {
  content: string;
}

class ConversationApiService {
  private baseUrl = '/api/conversations';

  // 대화 세션 시작
  async startConversation(request: StartConversationRequest): Promise<StartConversationResponse> {
    try {
      const response = await apiClient.post<StartConversationResponse>(`${this.baseUrl}/start`, request);

      return response.data;
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

      const response = await apiClient.post<Conversation>(`${this.baseUrl}?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  // 대화 세션 조회
  async getConversation(conversationId: number): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<Conversation>(`${this.baseUrl}/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 사용자별 대화 세션 목록
  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<Conversation[]>(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get conversations for user ${userId}:`, error);
      return [];
    }
  }

  // 사용자의 활성 대화 세션
  async getActiveConversation(userId: string): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<Conversation>(`${this.baseUrl}/user/${userId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get active conversation for user ${userId}:`, error);
      return null;
    }
  }

  // 질문별 대화 세션 목록
  async getConversationsByQuestion(questionId: number): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<Conversation[]>(`${this.baseUrl}/question/${questionId}`);
      return response.data;
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
      const response = await apiClient.put<Conversation>(`${this.baseUrl}/${conversationId}/status?${params.toString()}`);
      return response.data;
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
      const response = await apiClient.put<{
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
      }>(`${this.baseUrl}/${conversationId}/end`);
      return response.data;
    } catch (error) {
      console.error(`Failed to end conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 대화 처리 상태 확인
  async getProcessingStatus(conversationId: number): Promise<ProcessingStatusResponse | null> {
    try {
      const response = await apiClient.get<ProcessingStatusResponse>(`${this.baseUrl}/${conversationId}/processing-status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get processing status for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 생성된 일기 조회
  async getDiary(conversationId: number): Promise<DiaryResponse | null> {
    try {
      const response = await apiClient.get<DiaryResponse>(`${this.baseUrl}/${conversationId}/diary`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get diary for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 대화 메시지 목록 조회
  async getConversationMessages(conversationId: number): Promise<ConversationMessage[]> {
    try {
      const response = await apiClient.get<ConversationMessage[]>(`${this.baseUrl}/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get messages for conversation ${conversationId}:`, error);
      return [];
    }
  }

  // 사용자 메시지 저장
  async saveUserMessage(conversationId: number, content: string): Promise<ConversationMessage | null> {
    try {
      const params = new URLSearchParams({ content });
      const response = await apiClient.post<ConversationMessage>(`${this.baseUrl}/${conversationId}/messages/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to save user message for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // AI 메시지 저장
  async saveAIMessage(conversationId: number, content: string): Promise<ConversationMessage | null> {
    try {
      const params = new URLSearchParams({ content });
      const response = await apiClient.post<ConversationMessage>(`${this.baseUrl}/${conversationId}/messages/ai?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to save AI message for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 더미 대화 데이터 생성 (테스트용)
  async createDummyConversations(userId: string): Promise<string> {
    try {
      const response = await apiClient.post<string>(`${this.baseUrl}/dummy/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to create dummy conversations for user ${userId}:`, error);
      throw error;
    }
  }

  // 대화 컨텍스트 조회
  async getConversationContext(conversationMessageId: number): Promise<ConversationContextResponse> {
    try {
      const response = await apiClient.get<ConversationContextResponse>(`${this.baseUrl}/context/${conversationMessageId}`);
      return response.data;
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
      const response = await apiClient.get<string>(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Conversation service health check failed:', error);
      throw error;
    }
  }
}

export const conversationApiService = new ConversationApiService();
export default conversationApiService;
