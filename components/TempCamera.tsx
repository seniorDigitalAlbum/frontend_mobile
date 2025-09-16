import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AICharacter from './AICharacter';

interface TempCameraProps {
  onFaceDetected?: (faceData: any) => void;
  onCapture?: (photoUri: string) => void;
  onCameraReady?: () => void;
  navigation?: any;
  route?: any;
}

export default function TempCamera({ onFaceDetected, onCapture, onCameraReady, navigation, route }: TempCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const cameraRef = useRef<any>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // 카메라가 준비되면 얼굴 인식 시작
  useEffect(() => {
    if (isCameraReady && !isDetecting) {
      startFaceDetection();
    }
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isCameraReady]);

  const handleCameraReady = () => {
    setIsCameraReady(true);
    if (onCameraReady) {
      onCameraReady();
    }
  };

  // 얼굴 인식 시뮬레이션 (실제로는 TensorFlow.js 사용)
  const startFaceDetection = () => {
    if (isDetecting) return;
    
    setIsDetecting(true);
    
    // 2-3초마다 얼굴 인식 시도 (소리 없이)
    detectionInterval.current = setInterval(async () => {
      try {
        // 실제로는 여기서 TensorFlow.js로 얼굴 인식
        const faceDetected = await simulateFaceDetection();
        
        if (faceDetected && !isFaceDetected) {
          setIsFaceDetected(true);
          if (onFaceDetected) {
            onFaceDetected({
              success: true,
              message: '얼굴이 인식되었습니다!'
            });
          }
          
           // 자동으로 넘어가지 않고 사용자가 다음 버튼을 눌러야 함
        }
      } catch (error) {
        console.error('얼굴 인식 실패:', error);
      }
    }, 2000); // 2초로 늘림
  };

  // 실제 얼굴 인식 함수 (TensorFlow.js 사용)
  const simulateFaceDetection = async (): Promise<boolean> => {
    try {
      // 실제로는 여기서 TensorFlow.js로 얼굴 인식
      // 예시: @tensorflow/tfjs-react-native 사용
      
      // 소리 없이 프레임 분석 (takePictureAsync 대신)
      // 실제로는 CameraView의 onCameraReady나 다른 방법으로 프레임 접근
      
      // 임시 시뮬레이션: 더 현실적으로 만들기 위해 낮은 확률로 인식
      // 실제로는 얼굴이 카메라에 잘 보여야만 인식됨
      
      // 15% 확률로만 얼굴 인식 (실제로는 얼굴이 잘 보여야 함)
      return Math.random() > 0.85;
      
    } catch (error) {
      console.error('얼굴 인식 중 오류:', error);
      return false;
    }
  };

  // 실제 TensorFlow.js 얼굴 인식 함수 (구현 예시)
  /*
  const detectFaceWithTensorFlow = async (base64Image: string): Promise<boolean> => {
    try {
      // TensorFlow.js 모델 로드
      const model = await tf.loadLayersModel('path/to/face-detection-model');
      
      // 이미지를 텐서로 변환
      const imageTensor = tf.browser.fromPixels(base64Image);
      
      // 얼굴 인식 예측
      const prediction = model.predict(imageTensor) as tf.Tensor;
      const result = await prediction.data();
      
      // 결과 해석 (예: 0.5 이상이면 얼굴 인식)
      return result[0] > 0.5;
    } catch (error) {
      console.error('TensorFlow 얼굴 인식 실패:', error);
      return false;
    }
  };
  */

  const stopFaceDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setIsDetecting(false);
  };

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

  const screenHeight = Dimensions.get('window').height;
  const cameraHeight = screenHeight * 0.67; // 화면의 2/3

  if (!permission || permission.status !== "granted") {
    return (
      <View className="bg-gray-300 flex-1 justify-center items-center">
        <Text className="text-gray-600 text-lg">카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} className="px-6 py-3 bg-blue-500 rounded-lg">
          <Text className="text-white font-medium">권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-black flex-1">
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        ref={cameraRef}
        zoom={zoom}
        animateShutter={true}
        flash={flash}
        onCameraReady={handleCameraReady}
      >
        {/* 불투명 오버레이 - 화면 전체를 꽉 채움 */}
        <View 
          className="absolute bg-black/60 justify-center items-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
          pointerEvents="auto" // 터치 항상 활성화
        >
           {/* AI 캐릭터와 가이드 메시지 */}
           <View className="flex-1 justify-center items-center px-6">
             {/* 캐릭터와 메시지 컨텐츠 */}
             <View className="items-center">
               {/* 캐릭터 */}
               <AICharacter />
               
               {/* 얼굴 인식 상태에 따른 메시지 */}
               {isDetecting && !isFaceDetected && (
                 <>
                   <Text className="text-white text-xl font-medium text-center px-8 leading-7 mt-4">
                     얼굴이 잘 안보여요
                   </Text>
                   <Text className="text-white/80 text-sm text-center px-8 mt-3 leading-5">
                     카메라에 얼굴이 잘 보이도록 조정해주세요
                   </Text>
                   <View className="mt-4 flex-row items-center">
                     <View className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2" />
                     <Text className="text-yellow-400 text-sm">얼굴을 인식하고 있어요...</Text>
                   </View>
                 </>
               )}
               
               {isFaceDetected && (
                 <>
                   <Text className="text-white text-xl font-medium text-center px-8 leading-7 mt-4">
                     잘 보이네요!
                   </Text>
                   
                   {/* 다음 버튼 */}
                   <TouchableOpacity
                     onPress={() => {
                       if (navigation && route) {
                         // 마이크 테스트 화면으로 이동
                         navigation.navigate('MicrophoneTest', {
                           questionText: route.params?.questionText,
                           questionId: route.params?.questionId,
                           conversationId: route.params?.conversationId,
                           cameraSessionId: route.params?.cameraSessionId,
                           microphoneSessionId: route.params?.microphoneSessionId,
                         });
                       } else {
                         handleCameraReady();
                       }
                     }}
                     className="bg-blue-500 px-8 py-3 rounded-full mt-6"
                   >
                     <Text className="text-white text-lg font-bold">다음</Text>
                   </TouchableOpacity>
                 </>
               )}
             </View>
             
             {/* 빨간색 스트로크 원 - z-index로 뒤에 배치 */}
             {isFaceDetected && (
               <View 
                 className="absolute rounded-full border-8 border-red-500"
                 style={{
                   width: 300,
                   height: 300,
                   zIndex: -1, // 뒤에 배치
                 }}
               />
             )}
           </View>
        </View>

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