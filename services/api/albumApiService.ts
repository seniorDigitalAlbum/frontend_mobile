import { API_BASE_URL } from '../../config/api';
import apiClient from '../../config/api';

export interface AlbumComment {
  id: number;
  conversationId: number;
  userId: number;
  authorNickname: string;
  authorProfileImage: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumPhoto {
  id: number;
  conversationId: number;
  imageUrl: string;
  isCover: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
  author?: string;
}

export interface PhotoRequest {
  imageUrl: string;
  uploadedBy?: string;
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  message: string;
}

export interface DiaryDetail {
  conversationId: number;
  diary: string;
  title?: string; // 선택적 필드로 추가
  musicRecommendations: MusicRecommendation[];
  message: string;
  success: boolean;
  emotionSummary?: {
    dominantEmotion: string;
    averageConfidence: number;
    analyzedMessageCount: number;
    emotionCounts: { [key: string]: number };
  };
}

export interface MusicRecommendation {
  id: number;
  title: string;
  artist: string;
  youtubeVideoId?: string;
  youtubeLink?: string;
}

class AlbumApiService {
  private baseUrl = `${API_BASE_URL}/api/albums`;

  // ========== 댓글 관련 API ==========

  /**
   * 특정 대화의 댓글 목록을 조회합니다.
   */
  async getComments(conversationId: number): Promise<AlbumComment[]> {
    try {
      return await apiClient.get<AlbumComment[]>(`/api/albums/${conversationId}/comments`);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 댓글을 추가합니다.
   */
  async addComment(conversationId: number, request: CommentRequest): Promise<AlbumComment> {
    try {
      return await apiClient.post<AlbumComment>(`/api/albums/${conversationId}/comments`, request);
    } catch (error) {
      console.error('댓글 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글을 삭제합니다.
   */
  async deleteComment(commentId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/albums/comments/${commentId}`);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  }

  // ========== 사진 관련 API ==========

  /**
   * 특정 대화의 사진 목록을 조회합니다.
   */
  async getPhotos(conversationId: number): Promise<AlbumPhoto[]> {
    try {
      console.log('🔍 사진 목록 조회 API 호출:', `/api/albums/${conversationId}/photos`);
      const photos = await apiClient.get<AlbumPhoto[]>(`/api/albums/${conversationId}/photos`);
      console.log('🔍 사진 조회 성공:', photos);
      return photos;
    } catch (error) {
      console.error('사진 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 대화의 앨범 표지 사진을 조회합니다.
   */
  async getCoverPhoto(conversationId: number): Promise<AlbumPhoto | null> {
    try {
      return await apiClient.get<AlbumPhoto>(`/api/albums/${conversationId}/photos/cover`);
    } catch (error) {
      if (error.message.includes('404')) {
        return null; // 표지 사진이 없는 경우
      }
      console.error('표지 사진 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 사진을 추가합니다.
   */
  async addPhoto(conversationId: number, request: PhotoRequest): Promise<AlbumPhoto> {
    try {
      console.log('🔍 사진 추가 API 호출:', `/api/albums/${conversationId}/photos`);
      console.log('🔍 요청 데이터:', request);
      return await apiClient.post<AlbumPhoto>(`/api/albums/${conversationId}/photos`, request);
    } catch (error) {
      console.error('사진 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 파일을 직접 업로드하여 새로운 사진을 추가합니다.
   */
  async addPhotoWithUpload(conversationId: number, imageUri: string, uploadedBy: string = '가족'): Promise<AlbumPhoto> {
    try {
      console.log('🔍 사진 업로드 API 호출:', `/api/albums/${conversationId}/photos/upload`);
      
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
      formData.append('uploadedBy', uploadedBy);
      
      return await apiClient.request<AlbumPhoto>(`/api/albums/${conversationId}/photos/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('사진 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 사진을 앨범 표지로 설정합니다.
   */
  async setCoverPhoto(conversationId: number, photoId: number): Promise<boolean> {
    try {
      console.log('🔍 표지 설정 API 호출:', `/api/albums/${conversationId}/photos/${photoId}/set-cover`);
      await apiClient.put(`/api/albums/${conversationId}/photos/${photoId}/set-cover`);
      console.log('✅ 표지 설정 성공');
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error('표지 설정 실패:', error);
      return false; // 예외 시 false 반환
    }
  }

  /**
   * 시니어의 공개된 앨범 목록을 조회합니다.
   */
  async getSeniorPublicAlbums(seniorUserId: string): Promise<any[]> {
    try {
      console.log('🔍 시니어 공개 앨범 조회 API 호출:', `/api/albums/senior/${seniorUserId}/public-albums`);
      const result = await apiClient.get<any[]>(`/api/albums/senior/${seniorUserId}/public-albums`);
      console.log('✅ 시니어 공개 앨범 조회 성공:', result);
      return result;
    } catch (error) {
      console.error('시니어 공개 앨범 조회 실패:', error);
      return [];
    }
  }

  /**
   * 시니어의 최신 표지 사진을 조회합니다.
   */
  async getSeniorCoverPhoto(seniorUserId: string): Promise<string | null> {
    try {
      console.log('🔍 시니어 표지 사진 조회 API 호출:', `/api/albums/senior/${seniorUserId}/cover-photo`);
      const result = await apiClient.get<any>(`/api/albums/senior/${seniorUserId}/cover-photo`);
      console.log('✅ 시니어 표지 사진 조회 성공:', result);
      return result.imageUrl || null;
    } catch (error) {
      console.error('시니어 표지 사진 조회 실패:', error);
      return null;
    }
  }

  /**
   * 앨범 공개 상태를 업데이트합니다.
   */
  async updateAlbumVisibility(conversationId: number, isPublic: boolean): Promise<void> {
    try {
      console.log('🔍 앨범 공개 상태 업데이트 API 호출:', `/api/albums/${conversationId}/visibility`);
      console.log('🔍 공개 상태:', isPublic);
      await apiClient.put(`/api/albums/${conversationId}/visibility`, { isPublic });
      console.log('✅ 앨범 공개 상태 업데이트 성공');
    } catch (error) {
      console.error('앨범 공개 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 사진을 삭제합니다.
   */
  async deletePhoto(photoId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/albums/photos/${photoId}`);
    } catch (error) {
      console.error('사진 삭제 실패:', error);
      throw error;
    }
  }

  // ========== 이미지 업로드 API ==========

  /**
   * 이미지를 S3에 업로드합니다.
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      return await apiClient.request<UploadResponse>(`/api/albums/upload/image`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * React Native에서 이미지를 업로드합니다.
   */
  async uploadImageRN(uri: string, name: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: name,
      } as any);

      return await apiClient.request<UploadResponse>(`/api/albums/upload/image`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }

  // ========== 일기 관련 API는 conversationApiService로 이동됨 ==========
}

export default new AlbumApiService();
