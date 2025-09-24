import { API_BASE_URL } from '../config/api';

class ImageUploadService {
  private baseUrl = `${API_BASE_URL}/api/s3`;

  // 이미지를 S3에 업로드하고 URL 반환
  async uploadImage(imageUri: string): Promise<string> {
    try {
      // FormData 생성
      const formData = new FormData();
      
      // 이미지 파일을 FormData에 추가
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // 앨범 사진 업로드 요청
      const response = await fetch(`${this.baseUrl}/upload/album-photo`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data'는 FormData 사용 시 자동으로 설정되므로 제거
        },
        body: formData,
      });

      console.log('🔍 S3 업로드 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 S3 업로드 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 S3 업로드 응답:', result);
      
      if (!result.success) {
        throw new Error(result.message || '이미지 업로드 실패');
      }

      return result.fileUrl;
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
