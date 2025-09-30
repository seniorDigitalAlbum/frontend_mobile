import { Audio } from 'expo-av';
import conversationApiService from './api/conversationApiService';
import microphoneApiService from './api/microphoneApiService';
import sttService from './audio/sttService';

export interface MicrophoneTestParams {
    questionText: string;
    questionId?: number;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
}

export interface ConversationStartResult {
    conversationId: number;
    cameraSessionId: string;
    microphoneSessionId: string;
}

export interface STTTestResult {
    success: boolean;
    text: string;
    confidence: number;
    error?: string;
}

/**
 * 마이크 테스트 관련 서비스
 */
export class MicrophoneTestService {
    /**
     * 대화 세션 시작
     */
    static async startConversation(
        userId: string, 
        questionId?: number
    ): Promise<ConversationStartResult> {
        try {
            const startResponse = await conversationApiService.startConversation({
                userId: userId,
                questionId: questionId || 1
            });

            console.log('대화 세션 시작됨:', startResponse);

            return {
                conversationId: startResponse.conversationId,
                cameraSessionId: startResponse.cameraSessionId,
                microphoneSessionId: startResponse.microphoneSessionId
            };
        } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            throw new Error('대화를 시작할 수 없습니다. 다시 시도해주세요.');
        }
    }

    /**
     * 마이크 세션 상태 업데이트
     */
    static async updateMicrophoneSession(
        microphoneSessionId?: string
    ): Promise<void> {
        try {
            if (microphoneSessionId) {
                await microphoneApiService.updateSessionStatus(microphoneSessionId, 'ACTIVE');
                console.log('마이크 세션 상태가 ACTIVE로 업데이트됨');
            }
        } catch (error) {
            console.error('마이크 세션 상태 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 오디오 권한 요청
     */
    static async requestAudioPermissions(): Promise<boolean> {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('오디오 권한 요청 실패:', error);
            return false;
        }
    }

    /**
     * 오디오 모드 설정
     */
    static async setupAudioMode(): Promise<void> {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
        } catch (error) {
            console.error('오디오 모드 설정 실패:', error);
            throw error;
        }
    }

    /**
     * 녹음 시작
     */
    static async startRecording(): Promise<Audio.Recording> {
        try {
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            return recording;
        } catch (error) {
            console.error('녹음 시작 실패:', error);
            throw error;
        }
    }

    /**
     * 녹음 중지
     */
    static async stopRecording(recording: Audio.Recording | null): Promise<void> {
        try {
            if (recording) {
                await recording.stopAndUnloadAsync();
            }
        } catch (error) {
            console.error('녹음 중지 실패:', error);
            throw error;
        }
    }

    /**
     * STT 테스트 실행
     */
    static async runSTTTest(onRecordingStarted?: () => void): Promise<STTTestResult> {
        try {
            console.log('STT 테스트 시작...');
            
            // 녹음 시작
            const recordingStarted = await sttService.startRecording(onRecordingStarted);
            if (!recordingStarted) {
                return {
                    success: false,
                    text: '',
                    confidence: 0,
                    error: '녹음을 시작할 수 없습니다'
                };
            }

            // 3초 대기 (사용자가 말할 시간)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 녹음 중지 및 STT 변환
            const sttResult = await sttService.stopRecording();
            
            if (!sttResult) {
                return {
                    success: false,
                    text: '',
                    confidence: 0,
                    error: 'STT 변환에 실패했습니다'
                };
            }

            // 결과 분석
            const success = sttResult.status === 'success' && 
                           sttResult.text.trim().length > 0 && 
                           sttResult.confidence > 0.3;

            return {
                success,
                text: sttResult.text,
                confidence: sttResult.confidence,
                error: success ? undefined : `인식 실패 (신뢰도: ${(sttResult.confidence * 100).toFixed(1)}%)`
            };

        } catch (error) {
            console.error('STT 테스트 실패:', error);
            return {
                success: false,
                text: '',
                confidence: 0,
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }
}
