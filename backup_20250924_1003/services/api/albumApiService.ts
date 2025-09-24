import apiClient from './apiClient';

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
  diary: string;
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

export interface AlbumComment {
  id: number;
  conversationId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface AlbumPhoto {
  id: number;
  conversationId: number;
  imageUrl: string;
  isCover: boolean;
  uploadedBy: string;
  createdAt: string;
}

class ConversationApiService {
  private baseUrl = '/api/conversations';

  // 사용자 대화 목록 조회 (앨범 목록)
  async getConversationsByUser(userId: string = "1"): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<Conversation[]>(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get conversations for user ${userId}:`, error);
      return [];
    }
  }

  // 특정 대화의 일기 상세 조회
  async getDiaryByConversation(conversationId: number): Promise<DiaryDetail | null> {
    try {
      const response = await apiClient.get<DiaryDetail>(`${this.baseUrl}/${conversationId}/diary`);
      return response.data;
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
      const response = await apiClient.get<Conversation>(`${this.baseUrl}/${conversationId}`);
      return response.data;
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

  // 앨범 댓글 관련 API
  async getAlbumComments(conversationId: number): Promise<AlbumComment[]> {
    try {
      const response = await apiClient.get<AlbumComment[]>(`${this.baseUrl}/${conversationId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get comments for conversation ${conversationId}:`, error);
      return [];
    }
  }

  async addAlbumComment(conversationId: number, content: string, author: string = "가족"): Promise<AlbumComment | null> {
    try {
      const response = await apiClient.post<AlbumComment>(`${this.baseUrl}/${conversationId}/comments`, {
        content,
        author
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add comment for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 앨범 사진 관련 API
  async getAlbumPhotos(conversationId: number): Promise<AlbumPhoto[]> {
    try {
      const response = await apiClient.get<AlbumPhoto[]>(`${this.baseUrl}/${conversationId}/photos`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get photos for conversation ${conversationId}:`, error);
      return [];
    }
  }

  async addAlbumPhoto(conversationId: number, imageUrl: string, uploadedBy: string = "가족"): Promise<AlbumPhoto | null> {
    try {
      const response = await apiClient.post<AlbumPhoto>(`${this.baseUrl}/${conversationId}/photos`, {
        imageUrl,
        uploadedBy
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add photo for conversation ${conversationId}:`, error);
      return null;
    }
  }

  async setAlbumCover(conversationId: number, photoId: number): Promise<boolean> {
    try {
      await apiClient.put(`${this.baseUrl}/${conversationId}/photos/${photoId}/set-cover`);
      return true;
    } catch (error) {
      console.error(`Failed to set cover photo ${photoId} for conversation ${conversationId}:`, error);
      return false;
    }
  }

}

export const conversationApiService = new ConversationApiService();
export default conversationApiService;



