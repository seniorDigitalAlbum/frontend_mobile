import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import emotionService from '../services/emotionService';

interface HiddenCameraProps {
    onFaceDetected?: (imageData: any) => void;
    isRecording?: boolean; // 마이크 녹음 상태
    onRecordingStart?: () => void; // 녹음 시작 콜백
    onRecordingStop?: () => void; // 녹음 종료 콜백
    // 카메라 테스트용 props
    isVisible?: boolean; // 카메라를 사용자에게 보일지 여부
    isTestMode?: boolean; // 테스트 모드인지 여부
    isTestComplete?: boolean; // 테스트 완료 상태
    onTestFaceDetected?: (faceDetected: boolean, emotionData?: any) => void; // 테스트용 얼굴 인식 콜백
}

export default function HiddenCamera({ 
    onFaceDetected, 
    isRecording = false, 
    onRecordingStart, 
    onRecordingStop,
    isVisible = false,
    isTestMode = false,
    isTestComplete = false,
    onTestFaceDetected
}: HiddenCameraProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const cameraRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isImageSending, setIsImageSending] = useState(false);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const onFaceDetectedRef = useRef(onFaceDetected);
    const onRecordingStartRef = useRef(onRecordingStart);
    const onRecordingStopRef = useRef(onRecordingStop);
    const onTestFaceDetectedRef = useRef(onTestFaceDetected);
    
    // 현재 상태를 추적하기 위한 ref
    const isRecordingRef = useRef(isRecording);
    const isImageSendingRef = useRef(isImageSending);
    
    // 상태 변경 시 ref 업데이트
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);
    
    useEffect(() => {
        isImageSendingRef.current = isImageSending;
    }, [isImageSending]);

    // 콜백 함수들을 ref에 저장
    useEffect(() => {
        onFaceDetectedRef.current = onFaceDetected;
        onRecordingStartRef.current = onRecordingStart;
        onRecordingStopRef.current = onRecordingStop;
        onTestFaceDetectedRef.current = onTestFaceDetected;
    });

    const checkPermissions = async () => {
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
                try {
                    console.log('카메라 권한 요청 중...');
                    await requestPermission();
                } catch (error) {
                    console.error('카메라 권한 요청 실패:', error);
                    Alert.alert(
                        "권한 요청 실패",
                        "카메라 권한 요청에 실패했습니다. 브라우저 설정에서 카메라 권한을 확인해주세요.",
                        [{ text: "확인" }]
                    );
                }
            }
        }
    };

    useEffect(() => {
        checkPermissions();
    }, [permission]);


    // 테스트 모드에서 1초마다 얼굴 인식 처리
    useEffect(() => {
        let testTimer: NodeJS.Timeout | null = null;
        
        // 테스트가 완료되었으면 타이머 정리
        if (isTestComplete) {
            return () => {
                if (testTimer) {
                    clearTimeout(testTimer);
                    testTimer = null;
                }
            };
        }
        
        if (isTestMode && permission?.status === 'granted' && !isTestComplete) {
            
            const testFaceDetection = async () => {
                // 테스트가 완료되었으면 함수 실행 중단
                if (isTestComplete) {
                    return;
                }
                
                if (cameraRef.current && isTestMode) {
                    try {
                        // 카메라가 준비될 때까지 잠시 대기
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        const photo = await cameraRef.current.takePictureAsync({
                            quality: 0.8,
                            base64: false,
                            skipProcessing: true,
                            mute: true,
                            shutterSound: false
                        });
                        
                        if (photo?.uri) {
                            console.log('📸 사진 촬영 완료, YOLO 서버로 전송 중...');
                            // YOLO 서버로 얼굴 인식 요청
                            const emotionResult = await emotionService.analyzeEmotion({
                                uri: photo.uri,
                                timestamp: new Date().toISOString()
                            });
                            
                            // neutral이면 얼굴이 잘 안보인 것으로 판단
                            const faceDetected = Boolean(emotionResult.success && emotionResult.emotion && emotionResult.emotion !== 'neutral');
                            setIsFaceDetected(faceDetected);
                            
                            if (onTestFaceDetectedRef.current) {
                                onTestFaceDetectedRef.current(faceDetected, emotionResult);
                            }
                        }
                    } catch (error) {
                        setIsFaceDetected(false);
                        if (onTestFaceDetectedRef.current) {
                            onTestFaceDetectedRef.current(false, null);
                        }
                    }
                }
                
                // 0.3초 후 다시 실행 (테스트 모드에서만, 테스트가 완료되지 않았을 때만)
                if (isTestMode && !isTestComplete) {
                    testTimer = setTimeout(() => {
                        // 타이머 실행 시점에 다시 한번 체크
                        if (!isTestComplete) {
                            testFaceDetection();
                        }
                    }, 300);
                }
            };
            
            // 첫 번째 얼굴 인식 0.3초 후 실행 (카메라 로딩 대기)
            testTimer = setTimeout(() => {
                // 타이머 실행 시점에 다시 한번 체크
                if (!isTestComplete) {
                    testFaceDetection();
                }
            }, 300);
        }
        
        return () => {
            // 컴포넌트 언마운트 시 타이머 정리
            if (testTimer) {
                clearTimeout(testTimer);
                testTimer = null;
            }
        };
    }, [isTestMode, permission, isRecording, isImageSending, isTestComplete]);

    // 녹음 상태 변화 감지 및 이미지 전송 제어
    useEffect(() => {
        // 테스트 모드일 때는 녹음 모드 useEffect 비활성화
        if (isTestMode) {
            return;
        }
        
        if (permission?.status === 'granted') {
            if (isRecording && !isImageSending) {
                // 녹음 시작 - 이미지 전송 시작
                setIsImageSending(true);
                onRecordingStartRef.current?.();
                
                // 1초마다 이미지 캡처하여 AI 서버로 전송 (setTimeout 재귀 사용)
                
                const captureImage = async () => {
                    if (cameraRef.current) {
                        try {
                            // 이미지 캡처 (소리 없이)
                            const photo = await cameraRef.current.takePictureAsync({
                                quality: 0.8,
                                base64: false, // form-data로 전송하므로 base64 불필요
                                skipProcessing: true, // 빠른 처리
                                mute: true, // 셔터음 비활성화
                                shutterSound: false
                            });
                            
                        if (photo?.uri) {
                            // 감정 분석 서비스로 이미지 전송
                            const emotionResult = await emotionService.analyzeEmotion({
                                uri: photo.uri,
                                timestamp: new Date().toISOString()
                            });
                            
                            if (onFaceDetectedRef.current) {
                                onFaceDetectedRef.current({
                                    timestamp: new Date().toISOString(),
                                    uri: photo.uri,
                                    emotionResult: emotionResult,
                                    message: emotionResult.success 
                                        ? emotionService.formatEmotionResult(emotionResult.emotion, emotionResult.confidence)
                                        : '감정 분석 실패'
                                });
                            }
                        }
                        } catch (error) {
                            // 에러 처리
                        }
                    }
                    
                    // 1초 후 다시 실행 (녹음 중일 때만)
                    // ref를 사용해서 최신 상태 확인
                    if (isRecordingRef.current && isImageSendingRef.current) {
                        intervalRef.current = setTimeout(captureImage, 1000);
                    }
                };
                
                // 첫 번째 이미지 캡처 시작 (즉시 실행으로 테스트)
                captureImage();
                
                // 1초 후에도 실행
                intervalRef.current = setTimeout(() => {
                    captureImage();
                }, 1000);
            } else if (!isRecording && isImageSending) {
                // 녹음 종료 - 이미지 전송 중단
                setIsImageSending(false);
                onRecordingStopRef.current?.();
                
                // interval 정리
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [permission, isRecording, isImageSending]);

    if (!permission || permission.status !== "granted") {
        return null; // 권한이 없으면 아무것도 표시하지 않음
    }

    return (
        <View style={isVisible ? { flex: 1 } : { width: 1, height: 1, overflow: 'hidden' }}>
            <CameraView
                style={isVisible ? { flex: 1 } : { width: 1, height: 1 }}
                facing={facing}
                ref={cameraRef}
                zoom={0}
                animateShutter={false}
                flash="off"
                enableTorch={false}
                onCameraReady={() => {
                    console.log('카메라 준비 완료');
                }}
                onMountError={(error) => {
                    console.error('카메라 마운트 오류:', error);
                    if (error.message.includes('Timeout starting video source')) {
                        Alert.alert(
                            "카메라 접근 오류",
                            "카메라에 접근할 수 없습니다. 브라우저에서 카메라 권한을 확인하고 페이지를 새로고침해주세요.",
                            [{ text: "확인" }]
                        );
                    }
                }}
            />
        </View>
    );
}
