import { API_BASE_URL, API_ENDPOINTS, getYoloEmotionApiUrl } from '../../config/api';

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
    const apiUrl = `${getYoloEmotionApiUrl()}/predict_emotion`;
    console.log('🌐 감정 분석 API URL:', apiUrl);
    
    // 먼저 서버 연결 테스트
    console.log('🔍 서버 연결 테스트 시작...');
    try {
      const testResponse = await fetch(apiUrl, {
        method: 'GET',
      });
      console.log('🔍 서버 연결 테스트 응답:', testResponse.status, testResponse.statusText);
    } catch (testError) {
      console.error('🔍 서버 연결 테스트 실패:', testError);
    }
    
    // Base64 데이터를 Blob으로 변환
    const base64Data = imageUri.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');

    console.log('📤 FormData 생성 완료, API 요청 전송 중...');
    console.log('📤 전송할 이미지 URI:', imageUri);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 API 응답 상태:', response.status, response.statusText);
    console.log('📥 API 응답 헤더:', response.headers);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 감정 분석 성공:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ 감정 분석 API 호출 실패:', response.status, response.statusText);
      console.error('❌ 에러 응답 내용:', errorText);
      return null;
    }
    } catch (error) {
      console.error('💥 감정 분석 API 호출 중 오류:', error);
      console.error('💥 오류 상세:', error instanceof Error ? error.message : 'Unknown error');
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
    
    console.log('📊 변환된 요청 데이터:', requestData);
    
    const response = await fetch(`${API_BASE_URL}/api/emotion-analysis/facial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 얼굴 감정 분석 결과 전송 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 얼굴 감정 분석 결과 전송 실패:', error);
    return null;
  }
};
