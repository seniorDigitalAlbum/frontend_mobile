import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import sttService from './audio/sttService';
import conversationApiService from './api/conversationApiService';
import faceRecognitionApiService from './api/faceRecognitionApiService';
import sessionManager from './sessionManager';

interface UserResponseConfig {
  cameraSessionId: string;
  microphoneSessionId: string;
  conversationId: string;
  userId: string;
}

interface UserResponseResult {
  success: boolean;
  transcribedText?: string;
  emotionAnalysis?: any;
  error?: string;
}

class UserResponseProcessor {
  private isProcessing: boolean = false;

  // D-2: 사용자 답변 처리
  async processUserResponse(config: UserResponseConfig): Promise<UserResponseResult> {
    if (this.isProcessing) {
      return {
        success: false,
        error: '이미 처리 중입니다'
      };
    }

    this.isProcessing = true;

    try {
      console.log('D-2: 사용자 답변 처리 시작');

      // 1. STT 수행 (음성을 텍스트로 변환)
      const sttResult = await this.performSTT(config);
      if (!sttResult.success || !sttResult.transcribedText) {
        throw new Error('STT 처리 실패: ' + sttResult.error);
      }

      console.log('STT 결과:', sttResult.transcribedText);

      // 2. 표정(비디오) & 텍스트를 AI 서버 전송
      const emotionResult = await this.performEmotionAnalysis(config, sttResult.transcribedText);
      if (!emotionResult.success) {
        console.warn('감정 분석 실패:', emotionResult.error);
        // 감정 분석 실패해도 계속 진행
      }

      // 3. 사용자 메시지를 대화 세션에 저장
      await this.saveUserMessage(config, sttResult.transcribedText);

      console.log('D-2: 사용자 답변 처리 완료');

      return {
        success: true,
        transcribedText: sttResult.transcribedText,
        emotionAnalysis: emotionResult.emotionAnalysis
      };

    } catch (error) {
      console.error('D-2: 사용자 답변 처리 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    } finally {
      this.isProcessing = false;
    }
  }

  // STT 수행
  private async performSTT(config: UserResponseConfig): Promise<{ success: boolean; transcribedText?: string; error?: string }> {
    try {
      // 마이크 세션에서 녹음된 오디오 데이터 가져오기
      // 실제로는 마이크 세션에서 녹음된 데이터를 가져와야 함
      const audioData = await this.getRecordedAudioData(config.microphoneSessionId);
      
      if (!audioData) {
        throw new Error('녹음된 오디오 데이터가 없습니다');
      }

      // STT API 호출
      const sttResult = await sttService.transcribeAudio(audioData, 'wav', 'ko');
      
      if (sttResult && sttResult.text) {
        return {
          success: true,
          transcribedText: sttResult.text
        };
      } else {
        throw new Error('STT 변환 결과가 없습니다');
      }

    } catch (error) {
      console.error('STT 처리 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'STT 처리 실패'
      };
    }
  }

  // 감정 분석 수행
  private async performEmotionAnalysis(config: UserResponseConfig, text: string): Promise<{ success: boolean; emotionAnalysis?: any; error?: string }> {
    try {
      // 비디오 프레임 데이터 가져오기
      const videoFrame = await this.getVideoFrameData(config.cameraSessionId);
      
      if (!videoFrame) {
        throw new Error('비디오 프레임 데이터가 없습니다');
      }

      // 표정 감정 분석
      const facialEmotion = await faceRecognitionApiService.analyzeFacialEmotion(videoFrame);
      
      // 텍스트 감정 분석
      const textEmotion = await faceRecognitionApiService.analyzeTextEmotion(text);
      
      // 통합 감정 분석
      const combinedEmotion = await faceRecognitionApiService.combineEmotionAnalysis({
        facialEmotion,
        textEmotion,
        conversationMessageId: config.conversationId // 실제로는 메시지 ID 사용
      });

      return {
        success: true,
        emotionAnalysis: combinedEmotion
      };

    } catch (error) {
      console.error('감정 분석 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '감정 분석 실패'
      };
    }
  }

  // 사용자 메시지 저장
  private async saveUserMessage(config: UserResponseConfig, text: string): Promise<void> {
    try {
      await conversationApiService.saveUserMessage(config.conversationId, text);
      console.log('사용자 메시지 저장 완료:', text);
    } catch (error) {
      console.error('사용자 메시지 저장 실패:', error);
      throw error;
    }
  }

  // 녹음된 오디오 데이터 가져오기 (실제 구현 필요)
  private async getRecordedAudioData(microphoneSessionId: string): Promise<string | null> {
    try {
      // 실제로는 마이크 세션에서 녹음된 데이터를 가져와야 함
      // 여기서는 임시로 빈 문자열 반환
      console.log('마이크 세션에서 오디오 데이터 가져오기:', microphoneSessionId);
      return 'base64_audio_data_here';
    } catch (error) {
      console.error('오디오 데이터 가져오기 실패:', error);
      return null;
    }
  }

  // 비디오 프레임 데이터 가져오기 (실제 구현 필요)
  private async getVideoFrameData(cameraSessionId: string): Promise<string | null> {
    try {
      // 실제로는 카메라 세션에서 비디오 프레임을 가져와야 함
      // 여기서는 임시로 빈 문자열 반환
      console.log('카메라 세션에서 비디오 프레임 가져오기:', cameraSessionId);
      return 'base64_video_frame_here';
    } catch (error) {
      console.error('비디오 프레임 가져오기 실패:', error);
      return null;
    }
  }

  // 처리 상태 확인
  isProcessing(): boolean {
    return this.isProcessing;
  }
}

export default new UserResponseProcessor();
