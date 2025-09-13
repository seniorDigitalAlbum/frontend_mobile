import { predictEmotionApi, checkEmotionApiConnection, EmotionAnalysisResult } from './api/emotionApiService';

interface EmotionData {
  uri: string;
  timestamp?: string;
}

interface EmotionServiceResult {
  success: boolean;
  emotion?: string;
  confidence?: number;
  error?: string;
  data?: EmotionAnalysisResult;
}

/**
 * 감정 분석 서비스
 * 카메라 이미지를 분석하여 감정을 추출합니다.
 */
class EmotionService {
  /**
   * 이미지에서 감정 분석 수행
   * @param emotionData - 분석할 이미지 데이터
   * @returns Promise<EmotionServiceResult>
   */
  async analyzeEmotion(emotionData: EmotionData): Promise<EmotionServiceResult> {
    try {
      console.log('감정 분석 시작:', emotionData.uri);
      
      const result = await predictEmotionApi(emotionData.uri);
      
      if (result) {
        return {
          success: true,
          emotion: result.emotion,
          confidence: result.confidence,
          data: result,
        };
      } else {
        return {
          success: false,
          error: '감정 분석 API 호출 실패',
        };
      }
    } catch (error) {
      console.error('감정 분석 서비스 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 감정 분석 API 서버 연결 상태 확인
   * @returns Promise<boolean>
   */
  async checkConnection(): Promise<boolean> {
    try {
      return await checkEmotionApiConnection();
    } catch (error) {
      console.error('감정 분석 서버 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * 감정 분석 결과를 사용자 친화적인 메시지로 변환
   * @param emotion - 감정 분석 결과
   * @param confidence - 신뢰도
   * @returns string
   */
  formatEmotionResult(emotion?: string, confidence?: number): string {
    if (!emotion) {
      return '감정을 분석할 수 없습니다.';
    }

    const confidenceText = confidence ? ` (${Math.round(confidence * 100)}%)` : '';
    
    const emotionMap: { [key: string]: string } = {
      'happy': '기쁨',
      'sad': '슬픔',
      'angry': '화남',
      'fear': '두려움',
      'surprise': '놀람',
      'disgust': '혐오',
      'neutral': '평온',
    };

    const koreanEmotion = emotionMap[emotion.toLowerCase()] || emotion;
    return `${koreanEmotion}${confidenceText}`;
  }
}

// 싱글톤 인스턴스 생성
const emotionService = new EmotionService();

export default emotionService;
export type { EmotionData, EmotionServiceResult };
