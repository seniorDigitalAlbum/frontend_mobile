import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface HiddenCameraProps {
    onFaceDetected?: (imageData: any) => void;
}

export default function HiddenCamera({ onFaceDetected }: HiddenCameraProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const cameraRef = useRef<any>(null);

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
        if (permission?.status === 'granted') {
            // 1초마다 이미지 캡처하여 AI 서버로 전송
            const interval = setInterval(async () => {
                if (cameraRef.current) {
                    try {
                        // 이미지 캡처 (실제 구현에서는 takePictureAsync 사용)
                        // const photo = await cameraRef.current.takePictureAsync({
                        //     quality: 0.8,
                        //     base64: true,
                        // });

                        if (onFaceDetected) {
                            onFaceDetected({
                                timestamp: new Date().toISOString(),
                                // base64: photo.base64, // 실제 이미지 데이터
                                // uri: photo.uri,
                                message: 'AI 서버로 이미지 전송 준비'
                            });
                        }
                    } catch (error) {
                        console.log('이미지 캡처 실패:', error);
                    }
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [permission, onFaceDetected]);

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
