import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useCameraPermissions } from 'expo-camera';
import { CameraService, CameraTestParams } from '../services/cameraService';
import { CameraTestUtils } from '../utils/cameraTestUtils';
import { FaceDetectionService } from '../services/faceDetectionService';
import { CameraUtils } from '../utils/cameraUtils';

export interface UseCameraTestReturn {
    // 상태
    isMicTested: boolean;
    isCameraReady: boolean;
    canStart: boolean;
    userId: string;
    
    // 카메라 상태
    permission: any;
    requestPermission: () => void;
    facing: 'front' | 'back';
    flash: 'off' | 'on';
    zoom: number;
    isFaceDetected: boolean;
    isDetecting: boolean;
    cameraHeight: number;
    
    // 함수
    handleStart: () => Promise<void>;
    handleMicTest: () => Promise<void>;
    handleCameraReady: () => void;
    
    // 카메라 함수
    handleFaceDetected: (faceData: any) => void;
    handleCapture: (photoUri: string) => void;
    takePicture: () => Promise<void>;
    switchCamera: () => void;
    toggleFlash: () => void;
}

export const useCameraTest = (routeParams: any): UseCameraTestReturn => {
    const navigation = useNavigation();
    const { user } = useUser();
    const [permission, requestPermission] = useCameraPermissions();
    
    // 파라미터 추출
    const params = CameraTestUtils.extractParams(routeParams) as CameraTestParams & { microphoneSessionId?: string };
    const userId = user?.userId || "1";
    
    // 상태
    const [isMicTested, setIsMicTested] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    
    // 카메라 상태
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [zoom, setZoom] = useState(0);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    
    const cameraRef = useRef<any>(null);
    const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // 카메라 높이 계산
    const cameraHeight = CameraUtils.getCameraHeight();

    // 대화 시작 핸들러
    const handleStart = useCallback(async () => {
        try {
            const result = await CameraService.startConversation(
                userId, 
                params.questionId
            );

            // Conversation 화면으로 이동
            (navigation as any).navigate('Conversation', {
                questionText: params.questionText,
                questionId: params.questionId,
                conversationId: result.conversationId,
                cameraSessionId: result.cameraSessionId,
                microphoneSessionId: result.microphoneSessionId,
                userId: userId
            });
        } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            CameraTestUtils.showErrorAlert('대화를 시작할 수 없습니다. 다시 시도해주세요.');
        }
    }, [navigation, userId, params.questionText, params.questionId]);

    // 마이크 테스트 핸들러
    const handleMicTest = useCallback(async () => {
        try {
            await CameraService.updateMicrophoneSession(params.microphoneSessionId);
            setIsMicTested(true);
        } catch (error) {
            console.error('마이크 세션 상태 업데이트 실패:', error);
            // 에러가 발생해도 테스트는 완료로 처리
            setIsMicTested(true);
        }
    }, [params.microphoneSessionId]);

    // 카메라 준비 핸들러
    const handleCameraReady = useCallback(() => {
        setIsCameraReady(true);
    }, []);

    // 얼굴 인식 핸들러
    const handleFaceDetected = useCallback((faceData: any) => {
        setIsFaceDetected(true);
    }, []);

    // 사진 캡처 핸들러
    const handleCapture = useCallback((photoUri: string) => {
        // 필요시 처리
    }, []);

    // 사진 촬영
    const takePicture = useCallback(async () => {
        try {
            await CameraService.takePicture(
                cameraRef, 
                handleCapture, 
                handleFaceDetected
            );
        } catch (error) {
            console.error('사진 촬영 실패:', error);
        }
    }, [handleCapture, handleFaceDetected]);

    // 카메라 전환
    const switchCamera = useCallback(() => {
        setFacing(current => CameraUtils.toggleFacing(current));
    }, []);

    // 플래시 토글
    const toggleFlash = useCallback(() => {
        setFlash(current => CameraUtils.toggleFlash(current));
    }, []);


    // 초기 설정
    useEffect(() => {
        const initializeCamera = async () => {
            await CameraService.checkPermissions(permission, requestPermission);
            await CameraService.setupSilentCamera();
        };
        
        initializeCamera();
    }, [permission, requestPermission]);

    // 카메라가 준비되면 얼굴 인식 시작
    useEffect(() => {
        if (isCameraReady) {
            setIsDetecting(true);
            detectionInterval.current = FaceDetectionService.startFaceDetection(
                (faceData: any) => {
                    setIsFaceDetected(true);
                }
            );
        }
        
        return () => {
            FaceDetectionService.stopFaceDetection(detectionInterval.current);
            detectionInterval.current = null;
            setIsDetecting(false);
        };
    }, [isCameraReady]);

    // 시작 가능 여부
    const canStart = isMicTested;

    return {
        // 상태
        isMicTested,
        isCameraReady,
        canStart,
        userId,
        
        // 카메라 상태
        permission,
        requestPermission,
        facing,
        flash,
        zoom,
        isFaceDetected,
        isDetecting,
        cameraHeight,
        
        // 함수
        handleStart,
        handleMicTest,
        handleCameraReady,
        
        // 카메라 함수
        handleFaceDetected,
        handleCapture,
        takePicture,
        switchCamera,
        toggleFlash,
    };
};
