import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface TempCameraProps {
  onFaceDetected?: (faceData: any) => void;
  onCapture?: (photoUri: string) => void;
}

export default function TempCamera({ onFaceDetected, onCapture }: TempCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(0);
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

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (onCapture) {
          onCapture(photo.uri);
        }
        
        // 여기서 얼굴 인식 AI 모델 호출 가능
        if (onFaceDetected) {
          // photo.base64 데이터를 AI 모델에 전달
          onFaceDetected({
            uri: photo.uri,
            base64: photo.base64,
            width: photo.width,
            height: photo.height,
          });
        }
      } catch (error) {
        console.error('사진 촬영 실패:', error);
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
      }
    }
  };

  const switchCamera = () => {
    setFacing(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    setFlash(current => 
      current === 'off' ? 'on' : 'off'
    );
  };

  if (!permission || permission.status !== "granted") {
    return (
      <View className="bg-gray-300 rounded-2xl h-80 justify-center items-center">
        <Text className="text-gray-600 text-lg">카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} className="px-6 py-3 bg-blue-500 rounded-lg">
          <Text className="text-white font-medium">권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-black rounded-2xl h-80 overflow-hidden">
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        ref={cameraRef}
        zoom={zoom}
        animateShutter={true}
        flash={flash}
      >
        {/* 카메라 컨트롤 오버레이 */}
        <View className="absolute bottom-4 right-4">
          {/* 카메라 전환 */}
          <TouchableOpacity
            onPress={switchCamera}
            className="w-12 h-12 bg-black/50 rounded-full justify-center items-center"
          >
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
} 