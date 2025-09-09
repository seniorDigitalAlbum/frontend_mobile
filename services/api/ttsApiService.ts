import { API_BASE_URL } from '../../config/api';

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
    speed?: string;
    pitch?: string;
    volume?: string;
    format?: string;
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
    private baseUrl = `${API_BASE_URL}/api/tts`;

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
                    voice: request.voice || 'nara',
                    speed: request.speed || '0.5',
                    pitch: request.pitch || '0.0',
                    volume: request.volume || '0.0',
                    format: request.format || 'mp3',
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
                voice: 'nara',
                duration: 0,
                status: 'error',
                error: 'Clova TTS 변환에 실패했습니다.',
            };
        }
    }
}

export default new TTSApiService();
