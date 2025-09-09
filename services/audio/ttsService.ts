import { Audio } from 'expo-av';
import ttsApiService from '../api/ttsApiService';

interface TTSRequest {
    text: string;
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
    format: string;
}

interface TTSResponse {
    audioData: string;
    format: string;
    voice: string;
    duration: number;
    status: string;
    error?: string;
}

class TTSService {
    private sound: Audio.Sound | null = null;

    // TTS 서버 상태 확인
    async checkHealth(): Promise<boolean> {
        return await ttsApiService.checkHealth();
    }

    // 텍스트를 음성으로 변환 (간단한 TTS 사용)
    async synthesizeText(text: string): Promise<TTSResponse | null> {
        try {
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

    // Base64 오디오 데이터를 재생
    async playAudio(audioData: string, format: string = 'mp3', volume: number = 1.0): Promise<void> {
        try {
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
                if (status.didJustFinish) {
                    this.cleanup();
                }
            });

        } catch (error) {
            console.error('오디오 재생 실패:', error);
        }ㅛㅇ자가 
    }

    // 오디오 정지
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
