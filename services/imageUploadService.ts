import apiClient from './api/apiClient';

class ImageUploadService {
  private baseUrl = '/api/upload';

  // 이미지를 S3에 업로드하고 URL 반환
  async uploadImage(imageUri: string): Promise<string> {
    try {
      // FormData 생성
      const formData = new FormData();
      
      // 이미지 파일을 FormData에 추가
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // 업로드 요청
      const response = await apiClient.post(`${this.baseUrl}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || '이미지 업로드 실패');
      }

      return result.imageUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  }

  // 여러 이미지를 S3에 업로드하고 URL 배열 반환
  async uploadImages(imageUris: string[]): Promise<string[]> {
    try {
      const uploadPromises = imageUris.map(uri => this.uploadImage(uri));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('여러 이미지 업로드 실패:', error);
      throw error;
    }
  }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;
