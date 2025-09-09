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

  async checkHealth(): Promise<boolean> {
    console.log('STT 서비스 헬스체크 시작...');
    const result = await sttApiService.checkHealth();
    console.log('STT 서비스 헬스체크 결과:', result);
    return result;
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.log('이미 녹음 중입니다.');
        return false;
      }

      // 기존 녹음 객체가 있다면 정리
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (error) {
          console.log('기존 녹음 객체 정리 중 오류 (무시 가능):', error);
        }
        this.recording = null;
      }

      // 오디오 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('오디오 권한이 거부되었습니다.');
        return false;
      }

      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 녹음 시작
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
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
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;
      
      console.log('녹음이 시작되었습니다.');
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
      console.log('Base64 데이터 시작 부분:', audioData.substring(0, 100));

      // STT API 호출
      const result = await sttApiService.transcribeRealtime(audioData);
      console.log('STT 변환 결과:', result);
      
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
