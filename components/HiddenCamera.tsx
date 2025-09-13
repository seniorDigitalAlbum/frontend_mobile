import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import emotionService from '../services/emotionService';

interface HiddenCameraProps {
    onFaceDetected?: (imageData: any) => void;
    isRecording?: boolean; // 마이크 녹음 상태
}

export default function HiddenCamera({ onFaceDetected, isRecording = false }: HiddenCameraProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const cameraRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
                requestPermission();
            }
        }
    };

    useEffect(() => {
        checkPermissions();
    }, [permission]);


    // 실시간 이미지 캡처 및 AI 서버 전송
    useEffect(() => {
        if (permission?.status === 'granted' && isRecording) {
            // 녹음 중일 때만 1초마다 이미지 캡처하여 AI 서버로 전송
            intervalRef.current = setInterval(async () => {
                if (cameraRef.current) {
                    try {
                        // 이미지 캡처
                        const photo = await cameraRef.current.takePictureAsync({
                            quality: 0.8,
                            base64: false, // form-data로 전송하므로 base64 불필요
                        });

                        if (photo?.uri) {
                            // 감정 분석 서비스로 이미지 전송
                            const emotionResult = await emotionService.analyzeEmotion({
                                uri: photo.uri,
                                timestamp: new Date().toISOString()
                            });
                            
                            if (onFaceDetected) {
                                onFaceDetected({
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
                        console.log('이미지 캡처 실패:', error);
                    }
                }
            }, 1000);
        } else {
            // 녹음이 중단되면 interval 정리
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [permission, isRecording, onFaceDetected]);

    if (!permission || permission.status !== "granted") {
        return null; // 권한이 없으면 아무것도 표시하지 않음
    }

    return (
        <View style={{ width: 1, height: 1, overflow: 'hidden' }}>
            <CameraView
                style={{ width: 1, height: 1 }}
                facing={facing}
                ref={cameraRef}
                zoom={0}
                animateShutter={false}
                flash="off"
            />
        </View>
    );
}
