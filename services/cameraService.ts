import { Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import conversationApiService from './api/conversationApiService';
import microphoneApiService from './api/microphoneApiService';
import { API_BASE_URL } from '../config/api';

// 카메라 세션 관련 타입 정의
export interface CameraSession {
    id: string;
    userId: string;
    status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
    createdAt: string;
    updatedAt: string;
}

export interface CreateCameraSessionRequest {
    userId: string;
}

export interface UpdateSessionStatusRequest {
    status: 'ACTIVE' | 'RECORDING' | 'STOPPED' | 'ENDED';
}

export interface CameraTestParams {
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

/**
 * 통합된 카메라 관련 서비스
 */
export class CameraService {
    private static baseUrl = `${API_BASE_URL}/api/camera`;

    private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ===== API 관련 메서드들 =====
    
    /**
     * 카메라 세션 생성
     */
    static async createSession(request: CreateCameraSessionRequest): Promise<CameraSession> {
        return this.request<CameraSession>('/sessions', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /**
     * 카메라 세션 상태 업데이트
     */
    static async updateSessionStatus(sessionId: string, request: UpdateSessionStatusRequest): Promise<CameraSession> {
        return this.request<CameraSession>(`/sessions/${sessionId}/status`, {
            method: 'PUT',
            body: JSON.stringify(request),
        });
    }

    /**
     * 카메라 세션 조회
     */
    static async getSession(sessionId: string): Promise<CameraSession> {
        return this.request<CameraSession>(`/sessions/${sessionId}`);
    }

    /**
     * 사용자의 카메라 세션 목록 조회
     */
    static async getSessionsByUserId(userId: string): Promise<CameraSession[]> {
        return this.request<CameraSession[]>(`/sessions/user/${userId}`);
    }

    // ===== 비즈니스 로직 메서드들 =====
    
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

    // ===== 디바이스 관련 메서드들 =====
    
    /**
     * 카메라 권한 확인 및 요청
     */
    static async checkPermissions(permission: any, requestPermission: () => void) {
        if (!permission) return;

        if (permission.status !== "granted") {
            if (!permission.canAskAgain) {
                Alert.alert(
                    "권한 필요",
                    "앱 설정에서 카메라 권한을 변경해주세요.",
                    [
                        { text: "취소", style: "cancel" },
                        {
                            text: "설정 열기",
                            onPress: () => Linking.openSettings(),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                requestPermission();
            }
        }
    }

    /**
     * 카메라 소리 없애기 설정
     */
    static async setupSilentCamera() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            });
        } catch (error) {
            console.log('오디오 모드 설정 실패:', error);
        }
    }

    /**
     * 사진 촬영
     */
    static async takePicture(cameraRef: any, onCapture?: (uri: string) => void, onFaceDetected?: (data: any) => void) {
        if (!cameraRef.current) return;

        try {
            // 촬영 전에 오디오 모드 재설정
            await this.setupSilentCamera();
            
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: true,
                skipProcessing: true, // 소리 없이 촬영
            });
            
            if (onCapture) {
                onCapture(photo.uri);
            }
            
            if (onFaceDetected) {
                // photo.base64 데이터를 AI 모델에 전달
                onFaceDetected({
                    uri: photo.uri,
                    base64: photo.base64,
                    width: photo.width,
                    height: photo.height,
                });
            }

            return photo;
        } catch (error) {
            console.error('사진 촬영 실패:', error);
            Alert.alert('오류', '사진 촬영에 실패했습니다.');
            throw error;
        }
    }
}
