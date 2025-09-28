import { useState, useRef, useEffect, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { CameraService } from '../services/cameraService';
import { FaceDetectionService } from '../services/faceDetectionService';
import { CameraUtils } from '../utils/cameraUtils';

export interface UseTempCameraReturn {
    // 상태
    permission: any;
    requestPermission: () => void;
    facing: 'front' | 'back';
    flash: 'off' | 'on';
    zoom: number;
    isCameraReady: boolean;
    isFaceDetected: boolean;
    isDetecting: boolean;
    cameraHeight: number;
    
    // 함수
    handleCameraReady: () => void;
    handleFaceDetected: (faceData: any) => void;
    handleCapture: (photoUri: string) => void;
    takePicture: () => Promise<void>;
    switchCamera: () => void;
    toggleFlash: () => void;
    startFaceDetection: () => void;
    stopFaceDetection: () => void;
}

export const useTempCamera = (
    onFaceDetected?: (faceData: any) => void,
    onCapture?: (photoUri: string) => void,
    onCameraReady?: () => void
): UseTempCameraReturn => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [zoom, setZoom] = useState(0);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    
    const cameraRef = useRef<any>(null);
    const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // 카메라 높이 계산
    const cameraHeight = CameraUtils.getCameraHeight();

    // 권한 확인
    const checkPermissions = useCallback(async () => {
        await CameraService.checkPermissions(permission, requestPermission);
    }, [permission, requestPermission]);

    // 카메라 소리 없애기 설정
    const setupSilentCamera = useCallback(async () => {
        await CameraService.setupSilentCamera();
    }, []);

    // 카메라 준비 핸들러
    const handleCameraReady = useCallback(() => {
        setIsCameraReady(true);
        if (onCameraReady) {
            onCameraReady();
        }
    }, [onCameraReady]);

    // 얼굴 인식 핸들러
    const handleFaceDetected = useCallback((faceData: any) => {
        setIsFaceDetected(true);
        if (onFaceDetected) {
            onFaceDetected(faceData);
        }
    }, [onFaceDetected]);

    // 사진 캡처 핸들러
    const handleCapture = useCallback((photoUri: string) => {
        if (onCapture) {
            onCapture(photoUri);
        }
    }, [onCapture]);

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

    // 얼굴 인식 시작
    const startFaceDetection = useCallback(() => {
        if (isDetecting) return;
        
        setIsDetecting(true);
        detectionInterval.current = FaceDetectionService.startFaceDetection(
            handleFaceDetected,
            isDetecting,
            isFaceDetected
        );
    }, [isDetecting, isFaceDetected, handleFaceDetected]);

    // 얼굴 인식 중지
    const stopFaceDetection = useCallback(() => {
        FaceDetectionService.stopFaceDetection(detectionInterval.current);
        detectionInterval.current = null;
        setIsDetecting(false);
    }, []);

    // 초기 설정
    useEffect(() => {
        checkPermissions();
        setupSilentCamera();
    }, [checkPermissions, setupSilentCamera]);

    // 카메라가 준비되면 얼굴 인식 시작
    useEffect(() => {
        if (isCameraReady && !isDetecting) {
            startFaceDetection();
        }
        return () => {
            stopFaceDetection();
        };
    }, [isCameraReady, isDetecting, startFaceDetection, stopFaceDetection]);

    return {
        // 상태
        permission,
        requestPermission,
        facing,
        flash,
        zoom,
        isCameraReady,
        isFaceDetected,
        isDetecting,
        cameraHeight,
        
        // 함수
        handleCameraReady,
        handleFaceDetected,
        handleCapture,
        takePicture,
        switchCamera,
        toggleFlash,
        startFaceDetection,
        stopFaceDetection,
    };
};
