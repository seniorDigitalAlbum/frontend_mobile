/**
 * SessionManager 클래스
 * 
 * 카메라와 마이크 세션을 관리하는 서비스 클래스입니다.
 * D-1 단계에서 세션 생성과 정리를 담당합니다.
 * 
 * 주요 기능:
 * - 카메라 세션 생성 및 관리
 * - 마이크 세션 생성 및 관리
 * - 세션 상태 추적
 * - 세션 정리 및 리소스 해제
 * - iOS 오디오 세션 관리
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { CameraService } from './cameraService';
import microphoneApiService from './api/microphoneApiService';
import ttsService from './audio/ttsService';

/**
 * 세션 생성 설정 인터페이스
 */
interface SessionConfig {
  userId: string;                    // 사용자 ID
  conversationId?: string;           // 대화 ID (선택사항)
  resolution?: string;               // 카메라 해상도 (기본값: 1280x720)
  frameRate?: number;                // 프레임 레이트 (기본값: 30)
  audioFormat?: string;              // 오디오 형식 (기본값: WAV)
  sampleRate?: number;               // 샘플 레이트 (기본값: 44100)
}

/**
 * 세션 생성 결과 인터페이스
 */
interface SessionResult {
  cameraSessionId: string;           // 생성된 카메라 세션 ID
  microphoneSessionId: string;       // 생성된 마이크 세션 ID
  success: boolean;                  // 성공 여부
  error?: string;                    // 에러 메시지 (실패 시)
}

/**
 * SessionManager 클래스
 * 카메라와 마이크 세션의 생명주기를 관리합니다.
 */
class SessionManager {
  // 현재 활성화된 세션 ID들
  private currentCameraSessionId: string | null = null;
  private currentMicrophoneSessionId: string | null = null;
  private sessionActive: boolean = false;

  /**
   * D-1: 카메라·마이크 세션 생성
   * 
   * 카메라와 마이크 세션을 동시에 생성합니다.
   * TTS 재생을 완전히 종료한 후 세션을 생성합니다.
   * 
   * @param config - 세션 생성 설정
   * @returns Promise<SessionResult> - 세션 생성 결과
   */
  async createSessions(config: SessionConfig): Promise<SessionResult> {
    try {
      console.log('D-1: 카메라·마이크 세션 생성 시작');

      // TTS 완전 종료 (화면 전환 직전)
      await ttsService.stopTTSCompletely();
      console.log('TTS 완전 종료 완료');

      // iOS 오디오 세션을 Record/PlayAndRecord로 전환
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('iOS 오디오 세션을 Record 모드로 전환');
      }

      // 프론트: 로컬 미디어 시작 (비디오·오디오 각각)
      // 카메라 세션 생성
      const cameraSession = await CameraService.createSession({
        userId: config.userId
      });

      if (!cameraSession || !cameraSession.id) {
        throw new Error('카메라 세션 생성 실패');
      }

      // 마이크 세션 생성
      const microphoneSession = await microphoneApiService.createSession({
        userId: config.userId,
        audioFormat: config.audioFormat || 'WAV',
        sampleRate: config.sampleRate || 44100
      });

      if (!microphoneSession || !microphoneSession.id) {
        throw new Error('마이크 세션 생성 실패');
      }

      // 세션 ID 저장
      this.currentCameraSessionId = cameraSession.id;
      this.currentMicrophoneSessionId = microphoneSession.id;
      this.sessionActive = true;

      console.log('D-1: 세션 생성 완료', {
        cameraSessionId: this.currentCameraSessionId,
        microphoneSessionId: this.currentMicrophoneSessionId
      });

      return {
        cameraSessionId: this.currentCameraSessionId!,
        microphoneSessionId: this.currentMicrophoneSessionId!,
        success: true
      };

    } catch (error) {
      console.error('D-1: 세션 생성 실패:', error);
      
      // 실패 시 정리
      await this.cleanupSessions();
      
      return {
        cameraSessionId: '',
        microphoneSessionId: '',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 세션 종료 및 정리
   * 
   * 생성된 모든 세션을 정리하고 리소스를 해제합니다.
   * iOS의 경우 오디오 세션을 Playback 모드로 전환합니다.
   * 
   * @returns Promise<void>
   */
  async cleanupSessions(): Promise<void> {
    try {
      console.log('세션 종료 및 정리 시작');

      // 프론트: 로컬 트랙 stop/release
      if (this.currentCameraSessionId) {
        try {
          await CameraService.updateSessionStatus(this.currentCameraSessionId, { status: 'ENDED' });
          console.log('카메라 세션 삭제 완료:', this.currentCameraSessionId);
        } catch (error) {
          console.error('카메라 세션 삭제 실패:', error);
        }
      }

      if (this.currentMicrophoneSessionId) {
        try {
          await microphoneApiService.endSession(this.currentMicrophoneSessionId);
          console.log('마이크 세션 삭제 완료:', this.currentMicrophoneSessionId);
        } catch (error) {
          console.error('마이크 세션 삭제 실패:', error);
        }
      }

      // iOS 오디오 세션을 다시 Playback으로 전환
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('iOS 오디오 세션을 Playback 모드로 전환');
      }

      // 세션 상태 초기화
      this.currentCameraSessionId = null;
      this.currentMicrophoneSessionId = null;
      this.sessionActive = false;

      console.log('세션 종료 및 정리 완료');

    } catch (error) {
      console.error('세션 정리 실패:', error);
    }
  }

  /**
   * 현재 세션 정보 조회
   * 
   * 현재 활성화된 세션들의 정보를 반환합니다.
   * 
   * @returns 현재 세션 정보 객체
   */
  getCurrentSessions(): { cameraSessionId: string | null; microphoneSessionId: string | null; isActive: boolean } {
    return {
      cameraSessionId: this.currentCameraSessionId,
      microphoneSessionId: this.currentMicrophoneSessionId,
      isActive: this.sessionActive
    };
  }

  /**
   * 세션 활성 상태 확인
   * 
   * 현재 세션이 활성화되어 있는지 확인합니다.
   * 
   * @returns 세션 활성 여부
   */
  isSessionActive(): boolean {
    return this.sessionActive;
  }

  /**
   * 강제 세션 정리
   * 
   * API 호출 없이 세션 상태만 초기화합니다.
   * 앱 종료 시나 긴급 상황에서 사용합니다.
   */
  forceCleanup(): void {
    this.currentCameraSessionId = null;
    this.currentMicrophoneSessionId = null;
    this.sessionActive = false;
  }
}

export default new SessionManager();
