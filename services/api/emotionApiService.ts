import { apiClient, API_ENDPOINTS, getYoloEmotionApiUrl } from '../../config/api';

// 감정 분석 결과 타입 정의
export interface EmotionAnalysisResult {
  emotion?: string;
  confidence?: number;
  bounding_box?: number[];
  [key: string]: any;
}

// 얼굴 감정 분석 요청 타입
export interface FacialEmotionAnalysisRequest {
  conversationMessageId: number;
  finalEmotion: string;
  totalCaptures: number;
  emotionCounts: Record<string, number>;
  averageConfidence: number;
  captureDetails: Array<{
    timestamp: string;
    emotion: string;
    confidence: number;
  }>;
}

// 얼굴 감정 분석 응답 타입
export interface FacialEmotionAnalysisResponse {
  id: number;
  conversationMessageId: number;
  facialEmotion: string;
  facialConfidence: number;
  totalCaptures: number;
  emotionCounts: Record<string, number>;
  averageConfidence: number;
  captureDetails: Array<{
    timestamp: string;
    emotion: string;
    confidence: number;
  }>;
  createdAt: string;
}

/**
 * 감정 분석 API 호출 함수
 * @param imageUri - 전송할 이미지의 URI
 * @returns Promise<EmotionAnalysisResult | null>
 */
export const predictEmotionApi = async (imageUri: string): Promise<EmotionAnalysisResult | null> => {
  try {
    const baseUrl = getYoloEmotionApiUrl();
    const apiUrl = `${baseUrl}/predict_emotion`;
    
    // health 체크 비활성화 - 바로 API 호출
    
    // 이미지 URI 처리 (파일 URI 또는 Base64)
    const formData = new FormData();
    
    if (imageUri.startsWith('file://')) {
      // 파일 URI인 경우
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
    } else if (imageUri.startsWith('data:')) {
      // Base64 데이터인 경우
      const base64Data = imageUri.split(',')[1];
      
      // Base64 데이터 유효성 검사
      if (!base64Data || base64Data.length % 4 !== 0) {
        console.error('잘못된 Base64 데이터:', base64Data?.substring(0, 50) + '...');
        return null;
      }
      
      // Base64 패딩 추가 (필요한 경우)
      const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
      
      const byteCharacters = atob(paddedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      formData.append('file', blob, 'image.jpg');
    } else {
      console.error('지원하지 않는 이미지 URI 형식:', imageUri);
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500000); // 10초 타임아웃

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const errorText = await response.text();
      console.error('감정 분석 API 호출 실패:', response.status, response.statusText);
      console.error('에러 응답 내용:', errorText);
      return null;
    }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('감정 분석 요청 타임아웃 (10초 초과)');
      } else {
        console.error('감정 분석 API 호출 중 오류:', error);
        console.error('오류 상세:', error instanceof Error ? error.message : 'Unknown error');
      }
      return null;
    }
};


/**
 * 얼굴 감정 분석 결과 전송
 * @param request - 얼굴 감정 분석 요청 데이터
 * @returns Promise<FacialEmotionAnalysisResponse | null>
 */
export const sendFacialEmotionAnalysis = async (
  request: FacialEmotionAnalysisRequest
): Promise<FacialEmotionAnalysisResponse | null> => {
  try {
    // 백엔드가 기대하는 형식으로 변환
    const requestData = {
      conversationMessageId: request.conversationMessageId,
      facialEmotionData: {
        finalEmotion: request.finalEmotion,
        totalCaptures: request.totalCaptures,
        emotionCounts: request.emotionCounts,
        averageConfidence: request.averageConfidence,
        emotionDetails: request.captureDetails.map(detail => ({
          emotion: detail.emotion,
          confidence: detail.confidence,
          timestamp: detail.timestamp
        }))
      }
    };
    
    console.log('변환된 요청 데이터:', requestData);
    
    const result = await apiClient.post('/api/emotion-analysis/facial', requestData);
    return result;
  } catch (error) {
    console.error('얼굴 감정 분석 결과 전송 실패:', error);
    return null;
  }
};
