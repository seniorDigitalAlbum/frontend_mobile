import { Audio } from 'expo-av';
import sttApiService from '../api/sttApiService';

export interface STTResult {
  text: string;
  language: string;
  confidence: number;
  duration: number;
  status: string;
  error?: string;
}

class STTService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private onRecordingStarted: (() => void) | null = null;

  async checkHealth(): Promise<boolean> {
    console.log('STT 서비스 헬스체크 시작...');
    const result = await sttApiService.checkHealth();
    console.log('STT 서비스 헬스체크 결과:', result);
    return result;
  }

  async startRecording(onStarted?: () => void): Promise<boolean> {
    try {
      console.log('=== 녹음 시작 프로세스 시작 ===');
      
      if (this.isRecording) {
        console.log('이미 녹음 중입니다.');
        return false;
      }

      // 기존 녹음 객체가 있다면 정리
      if (this.recording) {
        console.log('기존 녹음 객체 정리 중...');
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (error) {
          console.log('기존 녹음 객체 정리 중 오류 (무시 가능):', error);
        }
        this.recording = null;
      }

      // 오디오 권한 요청
      console.log('오디오 권한 확인 중...');
      const permissionStartTime = Date.now();
      const { status } = await Audio.requestPermissionsAsync();
      const permissionEndTime = Date.now();
      console.log(`오디오 권한 확인 완료 (${permissionEndTime - permissionStartTime}ms 소요)`);
      
      if (status !== 'granted') {
        console.error('오디오 권한이 거부되었습니다.');
        return false;
      }

      // 오디오 모드 설정
      console.log('오디오 모드 설정 중...');
      const audioModeStartTime = Date.now();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const audioModeEndTime = Date.now();
      console.log(`오디오 모드 설정 완료 (${audioModeEndTime - audioModeStartTime}ms 소요)`);

      // 웹 환경에서 지원되는 MIME 타입 확인
      console.log('웹 환경 MIME 타입 확인 중...');
      let webMimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        // 가장 빠른 초기화를 위해 우선순위 조정
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          webMimeType = 'audio/webm';  // codecs 없이 더 빠른 초기화
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          webMimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          webMimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          webMimeType = 'audio/wav';
        }
        console.log('선택된 MIME 타입:', webMimeType);
      }

      // 녹음 시작
      console.log('녹음 설정 준비 중...');
      const recording = new Audio.Recording();
      
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: webMimeType,
          bitsPerSecond: 128000,
        },
      };

      console.log('녹음 옵션 설정:', recordingOptions);
      const prepareStartTime = Date.now();
      await recording.prepareToRecordAsync(recordingOptions);
      const prepareEndTime = Date.now();
      console.log(`녹음 준비 완료 (${prepareEndTime - prepareStartTime}ms 소요)`);

      console.log('녹음 시작 중...');
      const startTime = Date.now();
      await recording.startAsync();
      const endTime = Date.now();
      console.log(`녹음 시작 완료 (${endTime - startTime}ms 소요)`);
      this.recording = recording;
      this.isRecording = true;
      
      // 녹음이 실제로 시작된 후 콜백 호출
      if (onStarted) {
        onStarted();
      }
      
      console.log('=== 녹음 시작 프로세스 완료 ===');
      return true;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      return false;
    }
  }

  async stopRecording(): Promise<STTResult | null> {
    try {
      if (!this.isRecording || !this.recording) {
        console.log('녹음 중이 아닙니다.');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      // 녹음된 오디오 URI 가져오기
      const uri = this.recording.getURI();
      if (!uri) {
        console.error('녹음 파일 URI를 가져올 수 없습니다.');
        this.recording = null;
        return null;
      }

      // 오디오를 Base64로 변환
      const audioData = await this.convertAudioToBase64(uri);
      if (!audioData) {
        console.error('오디오를 Base64로 변환할 수 없습니다.');
        this.recording = null;
        return null;
      }

      // STT API 호출
      const result = await sttApiService.transcribeRealtime(audioData);
      
      // "시청해 주셔서 감사합니다"는 사용자가 말을 안한 것으로 처리
      if (result && result.text && result.text.includes('시청해 주셔서 감사합니다')) {
        console.log('STT 결과에서 "시청해 주셔서 감사합니다" 감지 - 인식 실패로 처리');
        return {
          text: '',
          language: 'ko',
          confidence: 0,
          duration: result.duration || 0,
          status: 'error',
          error: '사용자가 말을 하지 않았습니다'
        };
      }
      
      // 녹음 객체 정리
      this.recording = null;
      
      return result;
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  async transcribeAudio(audioData: any): Promise<STTResult | null> {
    try {
      console.log('STT 변환 시작');
      console.log('원본 오디오 데이터:', audioData);
      
      // 오디오 데이터를 Base64로 변환
      const base64Data = await this.convertAudioDataToBase64(audioData);
      if (!base64Data) {
        console.error('오디오 데이터를 Base64로 변환할 수 없습니다.');
        return {
          text: '',
          language: 'ko',
          confidence: 0,
          duration: 0,
          status: 'error',
          error: '오디오 데이터 변환 실패'
        };
      }

      console.log('Base64 변환 완료, 데이터 길이:', base64Data.length);
      
      // Base64 데이터가 너무 작으면 오디오가 제대로 녹음되지 않았을 가능성
      if (base64Data.length < 100) {
        console.warn('오디오 데이터가 너무 작습니다. 녹음이 제대로 되지 않았을 수 있습니다.');
        return {
          text: '',
          language: 'ko',
          confidence: 0,
          duration: 0,
          status: 'error',
          error: '오디오 데이터가 너무 작습니다'
        };
      }
      
      // STT API 호출
      const result = await sttApiService.transcribeAudio(base64Data);
      console.log('STT 변환 결과:', result);
      
      // "시청해 주셔서 감사합니다"는 사용자가 말을 안한 것으로 처리
      if (result && result.text && result.text.includes('시청해 주셔서 감사합니다')) {
        console.log('STT 결과에서 "시청해 주셔서 감사합니다" 감지 - 인식 실패로 처리');
        return {
          text: '',
          language: 'ko',
          confidence: 0,
          duration: result.duration || 0,
          status: 'error',
          error: '사용자가 말을 하지 않았습니다'
        };
      }
      
      return result;
    } catch (error) {
      console.error('STT 변환 실패:', error);
      return {
        text: '',
        language: 'ko',
        confidence: 0,
        duration: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async transcribeAudioFromUri(audioUri: string): Promise<STTResult | null> {
    try {
      console.log('오디오 URI에서 STT 변환 시작:', audioUri);
      
      // 오디오를 Base64로 변환
      const audioData = await this.convertAudioToBase64(audioUri);
      if (!audioData) {
        console.error('오디오를 Base64로 변환할 수 없습니다.');
        return null;
      }

      console.log('Base64 변환 완료, 데이터 길이:', audioData.length);

      // STT API 호출
      const result = await sttApiService.transcribeRealtime(audioData);
      console.log('STT 변환 결과:', result);
      
      // "시청해 주셔서 감사합니다"는 사용자가 말을 안한 것으로 처리
      if (result && result.text && result.text.includes('시청해 주셔서 감사합니다')) {
        console.log('STT 결과에서 "시청해 주셔서 감사합니다" 감지 - 인식 실패로 처리');
        return {
          text: '',
          language: 'ko',
          confidence: 0,
          duration: result.duration || 0,
          status: 'error',
          error: '사용자가 말을 하지 않았습니다'
        };
      }
      
      return result;
    } catch (error) {
      console.error('오디오 URI STT 변환 실패:', error);
      return null;
    }
  }

  private async convertAudioToBase64(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // data:audio/wav;base64, 부분 제거
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Base64 변환 실패:', error);
      return null;
    }
  }

  async convertAudioDataToBase64(audioData: any): Promise<string | null> {
    try {
      console.log('오디오 데이터 타입:', typeof audioData);
      console.log('오디오 데이터:', audioData);
      
      // audioData가 이미 Base64 문자열인 경우
      if (typeof audioData === 'string') {
        // Base64 문자열인지 확인하고 정리
        if (audioData.includes(',')) {
          // data:audio/wav;base64, 형태인 경우
          return audioData.split(',')[1];
        }
        // 이미 순수 Base64인 경우
        return audioData;
      }
      
      // audioData가 ArrayBuffer인 경우
      if (audioData instanceof ArrayBuffer) {
        const bytes = new Uint8Array(audioData);
        // React Native에서 Base64 인코딩
        const base64 = this.arrayBufferToBase64(bytes);
        return base64;
      }
      
      // audioData가 Blob인 경우
      if (audioData instanceof Blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // data:audio/wav;base64, 부분 제거
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioData);
        });
      }
      
      console.error('지원하지 않는 오디오 데이터 타입:', typeof audioData);
      return null;
    } catch (error) {
      console.error('오디오 데이터 Base64 변환 실패:', error);
      return null;
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    // React Native에서 Base64 인코딩을 위한 간단한 방법
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < buffer.length) {
      const a = buffer[i++];
      const b = i < buffer.length ? buffer[i++] : 0;
      const c = i < buffer.length ? buffer[i++] : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < buffer.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < buffer.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async cleanup(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('녹음 정리 중 오류:', error);
      }
      this.recording = null;
    }
    this.isRecording = false;
  }
}

export default new STTService();
