import { API_BASE_URL } from '../../config/api';

// 앨범 관련 타입 정의
export interface Album {
  id: number;
  userId: string;
  conversationId: number;
  finalEmotion: string;
  diaryContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlbumRequest {
  userId: string;
  conversationId: number;
  finalEmotion: string;
  diaryContent: string;
}

export interface UpdateAlbumRequest {
  finalEmotion: string;
  diaryContent: string;
}

class AlbumApiService {
  private baseUrl = `${API_BASE_URL}/api/albums`;

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
      console.error('Album API request failed:', error);
      throw error;
    }
  }

  // 앨범 생성
  async createAlbum(request: CreateAlbumRequest): Promise<Album> {
    try {
      const params = new URLSearchParams({
        userId: request.userId,
        conversationId: request.conversationId.toString(),
        finalEmotion: request.finalEmotion,
        diaryContent: request.diaryContent,
      });

      const response = await this.request<Album>(`?${params.toString()}`, {
        method: 'POST',
      });

      return response;
    } catch (error) {
      console.error('Failed to create album:', error);
      throw error;
    }
  }

  // 앨범 상세 조회
  async getAlbum(albumId: number): Promise<Album | null> {
    try {
      const response = await this.request<Album>(`/${albumId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get album ${albumId}:`, error);
      return null;
    }
  }

  // 사용자 앨범 목록
  async getAlbumsByUser(userId: string): Promise<Album[]> {
    try {
      const response = await this.request<Album[]>(`/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get albums for user ${userId}:`, error);
      return [];
    }
  }

  // 사용자 앨범 개수
  async getAlbumCount(userId: string): Promise<number> {
    try {
      const response = await this.request<number>(`/user/${userId}/count`);
      return response;
    } catch (error) {
      console.error(`Failed to get album count for user ${userId}:`, error);
      return 0;
    }
  }

  // 대화 세션별 앨범 조회
  async getAlbumByConversation(conversationId: number): Promise<Album | null> {
    try {
      const response = await this.request<Album>(`/conversation/${conversationId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get album for conversation ${conversationId}:`, error);
      return null;
    }
  }

  // 앨범 업데이트
  async updateAlbum(albumId: number, request: UpdateAlbumRequest): Promise<Album | null> {
    try {
      const params = new URLSearchParams({
        finalEmotion: request.finalEmotion,
        diaryContent: request.diaryContent,
      });

      const response = await this.request<Album>(`/${albumId}?${params.toString()}`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error(`Failed to update album ${albumId}:`, error);
      return null;
    }
  }

  // 앨범 삭제
  async deleteAlbum(albumId: number): Promise<boolean> {
    try {
      const response = await this.request<string>(`/${albumId}`, {
        method: 'DELETE',
      });
      return response.includes('성공적으로 삭제');
    } catch (error) {
      console.error(`Failed to delete album ${albumId}:`, error);
      return false;
    }
  }

  // 감정별 앨범 조회
  async getAlbumsByEmotion(userId: string, emotion: string): Promise<Album[]> {
    try {
      const response = await this.request<Album[]>(`/user/${userId}/emotion/${emotion}`);
      return response;
    } catch (error) {
      console.error(`Failed to get albums by emotion for user ${userId}:`, error);
      return [];
    }
  }

}

export const albumApiService = new AlbumApiService();
export default albumApiService;
