import { apiClient } from '../../config/api';

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
  isPublic?: boolean; // 앨범 공개 여부
  summary?: string; // 대화 요약
  diary?: string; // 생성된 일기
  dominantEmotion?: string; // 주요 감정
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
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      console.log('🔄 ConversationApiService.request 호출:', endpoint);
      const result = await apiClient.request<T>(`/api/conversations${endpoint}`, options);
      console.log('✅ ConversationApiService.request 성공:', endpoint);
      return result;
    } catch (error) {
      console.error('❌ Conversation API request failed:', error);
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

  // 보호자의 연결된 시니어들 대화 목록 조회
  async getGuardianSeniorsConversations(guardianId: string): Promise<Conversation[]> {
    try {
      const response = await this.request<Conversation[]>(`/guardian/${guardianId}/seniors/conversations`);
      return response;
    } catch (error) {
      console.error(`Failed to get guardian seniors conversations for guardian ${guardianId}:`, error);
      return [];
    }
  }

  // 특정 시니어의 대화 목록 조회
  async getSeniorConversations(seniorId: string, guardianId: string): Promise<Conversation[]> {
    try {
      const response = await this.request<Conversation[]>(`/senior/${seniorId}/conversations?guardianId=${guardianId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get senior conversations for senior ${seniorId}:`, error);
      return [];
    }
  }

  // 특정 시니어의 특정 대화 조회
  async getSeniorSpecificConversation(seniorId: string, conversationId: string, guardianId: string): Promise<Conversation | null> {
    try {
      const response = await this.request<Conversation>(`/senior/${seniorId}/conversations/${conversationId}?guardianId=${guardianId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get senior specific conversation for senior ${seniorId}, conversation ${conversationId}:`, error);
      return null;
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

  // ========== 일기 관련 API ==========

  /**
   * 특정 대화의 일기 상세 조회
   */
  async getDiaryByConversation(conversationId: number): Promise<any> {
    try {
      console.log('🔍 일기 조회 API 호출:', `/api/conversations/${conversationId}/diary`);
      const response = await this.request<any>(`/${conversationId}/diary`);
      
      if (response) {
        // title이 없는 경우 content에서 추출
        if (!response.title) {
          const extractedTitle = this.generateDefaultTitle(response);
          response.title = extractedTitle;
        }
        
        // content에서 제목 부분을 제거하고 순수 내용만 추출
        const cleanContent = this.extractContentWithoutTitle(response.diary);
        response.diary = cleanContent;
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to get diary for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 기본 제목 생성 함수
  private generateDefaultTitle(diaryDetail: any): string {
    // 1. 일기 내용에서 "제목:" 패턴 추출
    if (diaryDetail.diary) {
      const titleMatch = diaryDetail.diary.match(/^제목:\s*([^\n\r]+)/);
      if (titleMatch) {
        return titleMatch[1].trim();
      }
    }
    
    // 2. 일기 내용에서 첫 번째 문장 추출
    if (diaryDetail.diary) {
      const firstSentence = diaryDetail.diary.split('.').find((sentence: string) => sentence.trim().length > 10);
      if (firstSentence) {
        const trimmed = firstSentence.trim();
        // 20자 이내로 제한
        return trimmed.length > 20 ? trimmed.substring(0, 20) + '...' : trimmed;
      }
    }
    
    // 3. 감정 기반 제목 생성 (emotionSummary가 있는 경우)
    if (diaryDetail.emotionSummary && diaryDetail.emotionSummary.dominantEmotion) {
      const emotion = diaryDetail.emotionSummary.dominantEmotion;
      return `${emotion}의 하루`;
    }
    
    // 4. 최종 기본값
    const today = new Date().toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
    return `${today}의 기록`;
  }

  // content에서 제목 부분을 제거하는 함수
  private extractContentWithoutTitle(content: string): string {
    if (!content) return content;
    
    // "제목: ..." 패턴을 제거
    const titlePattern = /^제목:\s*[^\n\r]+\s*/;
    return content.replace(titlePattern, '').trim();
  }
}

export const conversationApiService = new ConversationApiService();
export default conversationApiService;