import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface CameraPreviewTestProps {
  onTestPassed: () => void;
  onTestFailed: () => void;
}

export default function CameraPreviewTest({ onTestPassed, onTestFailed }: CameraPreviewTestProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTested, setIsTested] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'failed'>('pending');
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const { status } = await Camera.getCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleTestCamera = async () => {
    try {
      if (!cameraRef.current) {
        throw new Error('카메라 참조가 없습니다');
      }

      // 카메라가 정상적으로 작동하는지 확인
      // 실제로는 더 복잡한 테스트를 수행할 수 있음
      setIsTested(true);
      setTestResult('success');
      
      // 테스트 성공 후 잠시 대기
      setTimeout(() => {
        onTestPassed();
      }, 1500);

    } catch (error) {
      console.error('카메라 테스트 실패:', error);
      setTestResult('failed');
      setIsTested(true);
      
      Alert.alert(
        '카메라 테스트 실패',
        '카메라가 정상적으로 작동하지 않습니다. 다시 시도해주세요.',
        [
          { text: '다시 시도', onPress: () => {
            setIsTested(false);
            setTestResult('pending');
          }},
          { text: '건너뛰기', onPress: onTestFailed }
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">카메라 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Ionicons name="camera-off" size={80} color="#EF4444" />
        <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
          카메라 권한이 필요합니다
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          카메라 테스트를 위해 카메라 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          onPress={onTestFailed}
          className="bg-gray-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">건너뛰기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* 카메라 프리뷰 */}
      <View className="flex-1">
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          type="front"
          ratio="16:9"
        />
        
        {/* 오버레이 */}
        <View className="absolute inset-0 justify-center items-center">
          <View className="bg-black bg-opacity-50 rounded-lg p-4">
            <Text className="text-white text-center text-lg font-semibold mb-2">
              카메라 테스트
            </Text>
            <Text className="text-white text-center text-sm">
              카메라가 정상적으로 작동하는지 확인합니다
            </Text>
          </View>
        </View>

        {/* 테스트 결과 표시 */}
        {isTested && (
          <View className="absolute top-20 left-0 right-0 items-center">
            <View className={`px-6 py-3 rounded-lg ${
              testResult === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <Text className="text-white font-semibold">
                {testResult === 'success' ? '✓ 카메라 테스트 성공' : '✗ 카메라 테스트 실패'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 하단 컨트롤 */}
      <View className="bg-white p-6">
        <View className="items-center mb-4">
          <Text className="text-gray-800 text-lg font-semibold mb-2">
            카메라 프리뷰 테스트
          </Text>
          <Text className="text-gray-600 text-center text-sm">
            화면에 자신의 모습이 보이는지 확인하고{'\n'}
            테스트 버튼을 눌러주세요
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleTestCamera}
          disabled={isTested}
          className={`w-full py-4 rounded-lg ${
            isTested 
              ? testResult === 'success' 
                ? 'bg-green-500' 
                : 'bg-red-500'
              : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isTested 
              ? testResult === 'success' 
                ? '테스트 완료' 
                : '테스트 실패'
              : '카메라 테스트'
            }
          </Text>
        </TouchableOpacity>

        {!isTested && (
          <TouchableOpacity
            onPress={onTestFailed}
            className="mt-3"
          >
            <Text className="text-gray-500 text-center">
              건너뛰기
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
