import apiClient from './apiClient';

export interface TTSSimpleResponse {
    audioData: string;
    format: string;
    voice: string;
    duration: number;
    status: string;
    error?: string;
}

export interface TTSClovaRequest {
    text: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
    format?: string;
}

export interface TTSResponse {
    audioData: string;
    format: string;
    voice: string;
    duration: number;
    status: string;
    error?: string;
}

export interface TTSClovaResponse {
    audioData: string;
    format: string;
    voice: string;
    duration: number;
    status: string;
    error?: string;
}

class TTSApiService {
    private baseUrl = '/api/tts';

    // TTS 서비스 상태 확인
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('TTS 서비스 상태 확인 실패:', error);
            return false;
        }
    }

    // 간단한 TTS 변환
    async synthesizeSimple(text: string): Promise<TTSSimpleResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/simple?text=${encodeURIComponent(text)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('간단한 TTS 변환 실패:', error);
            return {
                audioData: '',
                format: 'mp3',
                voice: 'default',
                duration: 0,
                status: 'error',
                error: 'TTS 변환에 실패했습니다.',
            };
        }
    }

    // Naver Clova TTS 변환
    async synthesizeClova(request: TTSClovaRequest): Promise<TTSClovaResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: request.text,
                    voice: request.voice || 'ko-KR-Wavenet-A',
                    speed: request.speed || 1.0,
                    pitch: request.pitch || 0.0,
                    volume: request.volume || 0.0,
                    format: request.format || 'MP3',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Clova TTS 변환 실패:', error);
            return {
                audioData: '',
                format: 'mp3',
                voice: 'ko-KR-Wavenet-A',
                duration: 0,
                status: 'error',
                error: 'Clova TTS 변환에 실패했습니다.',
            };
        }
    }

    // 새로운 TTS API (요구사항에 맞는 형식)
    async synthesize(request: TTSClovaRequest): Promise<TTSResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: request.text,
                    voice: request.voice || 'ko-KR-Wavenet-A',
                    speed: request.speed || 1.0,
                    pitch: request.pitch || 0.0,
                    volume: request.volume || 0.0,
                    format: request.format || 'MP3',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('TTS 변환 실패:', error);
            return {
                audioBase64: '',
                format: 'mp3',
                voice: 'ko-KR-Wavenet-A',
                speed: 1.0,
                status: 'error',
                message: 'TTS 변환에 실패했습니다.',
            };
        }
    }
}

export default new TTSApiService();
