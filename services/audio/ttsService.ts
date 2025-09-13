/**
 * TTSService 클래스
 * 
 * Text-to-Speech 서비스를 관리하는 클래스입니다.
 * C-1 단계에서 AI 질문을 음성으로 변환하여 재생합니다.
 * 
 * 주요 기능:
 * - 텍스트를 음성으로 변환 (TTS)
 * - Base64 오디오 데이터 재생
 * - iOS 오디오 세션 관리
 * - 오디오 재생 제어 (재생, 정지, 볼륨 조절)
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import ttsApiService from '../api/ttsApiService';

/**
 * TTS 요청 인터페이스
 */
interface TTSRequest {
    text: string;        // 변환할 텍스트
    voice: string;       // 음성 종류
    speed: number;       // 재생 속도
    pitch: number;       // 음높이
    volume: number;      // 볼륨
    format: string;      // 오디오 형식
}

/**
 * TTS 응답 인터페이스
 */
interface TTSResponse {
    audioData: string;   // Base64 인코딩된 오디오 데이터
    format: string;      // 오디오 형식
    voice: string;       // 사용된 음성
    duration: number;    // 오디오 길이 (초)
    status: string;      // 처리 상태
    error?: string;      // 에러 메시지 (실패 시)
}

/**
 * TTSService 클래스
 * TTS 기능을 제공하고 오디오 재생을 관리합니다.
 */
class TTSService {
    private sound: Audio.Sound | null = null;

    /**
     * iOS 오디오 세션을 Playback 모드로 설정
     * 
     * TTS 재생을 위해 iOS 오디오 세션을 Playback 모드로 전환합니다.
     * 녹음 기능을 비활성화하고 재생에 최적화된 설정을 적용합니다.
     * 
     * @returns Promise<void>
     */
    private async setPlaybackMode(): Promise<void> {
        if (Platform.OS === 'ios') {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (error) {
                console.error('iOS 오디오 세션 설정 실패:', error);
            }
        }
    }

    /**
     * iOS 오디오 세션을 Record/PlayAndRecord 모드로 설정
     * 
     * 녹음이나 실시간 통신을 위해 iOS 오디오 세션을 Record 모드로 전환합니다.
     * 녹음과 재생을 동시에 지원하는 설정을 적용합니다.
     * 
     * @returns Promise<void>
     */
    private async setRecordMode(): Promise<void> {
        if (Platform.OS === 'ios') {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (error) {
                console.error('iOS 오디오 세션 설정 실패:', error);
            }
        }
    }

    /**
     * TTS 서버 상태 확인
     * 
     * TTS 서버가 정상적으로 작동하는지 확인합니다.
     * 
     * @returns Promise<boolean> - 서버 상태 (true: 정상, false: 오류)
     */
    async checkHealth(): Promise<boolean> {
        return await ttsApiService.checkHealth();
    }

    /**
     * 텍스트를 음성으로 변환 (간단한 TTS 사용)
     * 
     * 주어진 텍스트를 TTS API를 통해 음성 데이터로 변환합니다.
     * 기본 설정으로 한국어 음성을 생성합니다.
     * 
     * @param text - 변환할 텍스트
     * @returns Promise<TTSResponse | null> - TTS 응답 또는 null
     */
    async synthesizeText(text: string): Promise<TTSResponse | null> {
        try {
            // 텍스트 유효성 검사
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                console.error('TTS 변환 실패: 유효하지 않은 텍스트:', text);
                return null;
            }

            // TTS 서버 상태 먼저 확인
            const isHealthy = await this.checkHealth();
            if (!isHealthy) {
                console.error('TTS 서버가 응답하지 않습니다.');
                return null;
            }

            // Clova TTS API 사용
            const result = await ttsApiService.synthesizeClova({
                text: text,
                voice: 'ko-KR-Neural2-A', // Google TTS에서 사용 가능한 한국어 음성
                speed: '1.2', // 속도를 더 빠르게 (더 크게 들리도록)
                pitch: '0.0',
                volume: '16.0', // 최대 볼륨으로 설정 (16dB)
                format: 'mp3'
            });
            
            if (result.status === 'success' && result.audioData) {
                return {
                    audioData: result.audioData,
                    format: result.format,
                    voice: result.voice,
                    duration: result.duration,
                    status: result.status
                };
            } else {
                console.error('TTS 변환 실패:', result.error);
                return null;
            }

        } catch (error) {
            console.error('TTS 서비스 오류:', error);
            return null;
        }
    }

    /**
     * Base64 오디오 데이터를 재생 (C-1: AI 질문 TTS 재생)
     * 
     * Base64로 인코딩된 오디오 데이터를 디코딩하여 재생합니다.
     * iOS의 경우 오디오 세션을 Playback 모드로 설정합니다.
     * 
     * @param audioData - Base64 인코딩된 오디오 데이터
     * @param format - 오디오 형식 (기본값: mp3)
     * @param volume - 재생 볼륨 (기본값: 1.0)
     * @returns Promise<void>
     */
    async playAudio(audioData: string, format: string = 'mp3', volume: number = 1.0): Promise<void> {
        try {
            // iOS 오디오 세션을 Playback으로 설정
            await this.setPlaybackMode();
            
            // 이전 재생 중인 오디오 정지
            if (this.sound) {
                await this.sound.stopAsync();
                await this.sound.unloadAsync();
            }

            // Base64를 ArrayBuffer로 변환
            const base64Data = audioData;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // 오디오 로드 및 재생
            const { sound } = await Audio.Sound.createAsync(
                { uri: `data:audio/${format};base64,${audioData}` },
                { 
                    shouldPlay: true,
                    volume: 1.0, // 최대 볼륨으로 설정
                    isLooping: false,
                    rate: 1.0,
                    shouldCorrectPitch: true
                }
            );

            // 재생 시작 후 볼륨을 설정
            await sound.setVolumeAsync(volume);
            
            // 여러 번 볼륨을 설정
            setTimeout(async () => {
                try {
                    await sound.setVolumeAsync(volume);
                } catch (error) {
                    console.log('볼륨 설정 중 오류:', error);
                }
            }, 50);
            
            setTimeout(async () => {
                try {
                    await sound.setVolumeAsync(volume);
                } catch (error) {
                    console.log('볼륨 설정 중 오류:', error);
                }
            }, 200);

            this.sound = sound;

            // 재생 완료 시 정리
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    this.cleanup();
                }
            });

        } catch (error) {
            console.error('오디오 재생 실패:', error);
        }
    }

    // 오디오 정지 및 완전 종료
    async stopAudio(): Promise<void> {
        if (this.sound) {
            try {
                await this.sound.stopAsync();
                await this.sound.unloadAsync();
            } catch (error) {
                console.error('오디오 정지 실패:', error);
            } finally {
                this.sound = null;
            }
        }
    }

    /**
     * TTS 완전 종료 (D-1 전에 호출)
     * 
     * 현재 재생 중인 TTS를 완전히 종료하고 iOS 오디오 세션을 Record 모드로 전환합니다.
     * 세션 생성 전에 호출되어 녹음 준비를 합니다.
     * 
     * @returns Promise<void>
     */
    async stopTTSCompletely(): Promise<void> {
        await this.stopAudio();
        // iOS 오디오 세션을 Record 모드로 전환 준비
        await this.setRecordMode();
    }

    // 리소스 정리
    private cleanup(): void {
        if (this.sound) {
            this.sound.unloadAsync();
            this.sound = null;
        }
    }

    // 컴포넌트 언마운트 시 정리
    destroy(): void {
        this.cleanup();
    }
}

export default new TTSService();
