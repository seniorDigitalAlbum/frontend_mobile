import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

// 감정 분석 결과 타입 정의
export interface EmotionAnalysisResult {
  emotion?: string;
  confidence?: number;
  [key: string]: any;
}

/**
 * 감정 분석 API 호출 함수
 * @param imageUri - 전송할 이미지의 URI
 * @returns Promise<EmotionAnalysisResult | null>
 */
export const predictEmotionApi = async (imageUri: string): Promise<EmotionAnalysisResult | null> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.emotion.predict}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('감정 분석 결과:', result);
      return result;
    } else {
      console.error('감정 분석 API 호출 실패:', response.status);
      return null;
    }
  } catch (error) {
    console.error('감정 분석 API 호출 중 오류:', error);
    return null;
  }
};

/**
 * 감정 분석 API 서버 연결 상태 확인
 * @returns Promise<boolean>
 */
export const checkEmotionApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.emotion.health}`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('감정 분석 API 서버 연결 확인 실패:', error);
    return false;
  }
};
