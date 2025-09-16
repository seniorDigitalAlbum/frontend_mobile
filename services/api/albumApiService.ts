import { API_BASE_URL } from '../../config/api';

// 대화 관련 타입 정의
export interface Conversation {
  id: number;
  userId: string;
  questionId: number;
  cameraSessionId: string;
  microphoneSessionId: string;
  status: string;
  createdAt: string;
  endedAt: string;
  summary: string;
  diary: string;
  processingStatus: string;
  dominantEmotion: string;
  emotionConfidence: number;
  emotionDistribution: string;
}

export interface DiaryDetail {
  conversationId: number;
  summary: string;
  diary: string;
  emotionSummary: {
    dominantEmotion: string;
    emotionCounts: Record<string, number>;
    averageConfidence: number;
    analyzedMessageCount: number;
  };
  musicRecommendations: MusicRecommendation[];
  message: string;
  success: boolean;
}

export interface MusicRecommendation {
  id: number;
  conversationId: number;
  title: string;
  artist: string;
  mood: string;
  youtubeLink: string;
  youtubeVideoId: string;
  createdAt: string;
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

  // 사용자 대화 목록 조회 (앨범 목록)
  async getConversationsByUser(userId: string = "1"): Promise<Conversation[]> {
    try {
      const response = await this.request<Conversation[]>(`/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversations for user ${userId}:`, error);
      return [];
    }
  }

  // 특정 대화의 일기 상세 조회
  async getDiaryByConversation(conversationId: number): Promise<DiaryDetail | null> {
    try {
      const response = await this.request<DiaryDetail>(`/${conversationId}/diary`);
      return response;
    } catch (error) {
      console.error(`Failed to get diary for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 사용자 대화 개수 조회
  async getConversationCount(userId: string = "1"): Promise<number> {
    try {
      const conversations = await this.getConversationsByUser(userId);
      return conversations.length;
    } catch (error) {
      console.error(`Failed to get conversation count for user ${userId}:`, error);
      return 0;
    }
  }

  // 특정 대화 조회
  async getConversation(conversationId: number): Promise<Conversation | null> {
    try {
      const response = await this.request<Conversation>(`/${conversationId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 감정별 대화 조회
  async getConversationsByEmotion(userId: string = "1", emotion: string): Promise<Conversation[]> {
    try {
      const conversations = await this.getConversationsByUser(userId);
      return conversations.filter(conv => conv.dominantEmotion === emotion);
    } catch (error) {
      console.error(`Failed to get conversations by emotion for user ${userId}:`, error);
      return [];
    }
  }

}

export const conversationApiService = new ConversationApiService();
export default conversationApiService;



