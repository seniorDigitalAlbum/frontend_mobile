import { analyzeFaceApi } from './api/faceRecognitionApiService';

interface FaceData {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

interface FaceRecognitionResult {
  success: boolean;
  faceDetected: boolean;
  emotion?: string;
  age?: number;
  gender?: string;
  confidence?: number;
  error?: string;
}

// 얼굴 인식 AI 모델 호출
export const analyzeFace = async (faceData: FaceData): Promise<FaceRecognitionResult> => {
  return await analyzeFaceApi(faceData);
};

// 로컬 얼굴 인식 (TensorFlow.js 또는 MediaPipe 사용)
export const analyzeFaceLocal = async (faceData: FaceData): Promise<FaceRecognitionResult> => {
  try {
    // 여기서 로컬 AI 모델을 사용하여 얼굴 인식
    // 예: TensorFlow.js, MediaPipe, 또는 기타 로컬 AI 라이브러리
    
    // 임시 구현 (실제로는 AI 모델 호출)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          faceDetected: true,
          emotion: 'happy',
          age: 25,
          gender: 'female',
          confidence: 0.85,
        });
      }, 1000);
    });
  } catch (error) {
    console.error('로컬 얼굴 인식 실패:', error);
    return {
      success: false,
      faceDetected: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};

// 얼굴 인식 결과를 기반으로 감정 분석
export const analyzeEmotion = async (faceData: FaceData): Promise<string> => {
  try {
    const result = await analyzeFace(faceData);
    
    if (result.success && result.faceDetected && result.emotion) {
      return result.emotion;
    }
    
    return 'unknown';
  } catch (error) {
    console.error('감정 분석 실패:', error);
    return 'unknown';
  }
};
