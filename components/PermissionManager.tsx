/**
 * PermissionManager 컴포넌트
 * 
 * 카메라와 마이크 권한을 요청하고 관리하는 컴포넌트입니다.
 * B-1 단계에서 사용되며, 권한 상태에 따라 적절한 UI를 표시합니다.
 * 
 * 기능:
 * - 카메라 권한 요청 및 확인
 * - 마이크 권한 요청 및 확인
 * - 권한 상태에 따른 UI 표시
 * - 권한 요청 결과 콜백 호출
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

/**
 * PermissionManager Props 인터페이스
 */
interface PermissionManagerProps {
  onPermissionsGranted: () => void;  // 모든 권한이 허용되었을 때 호출
  onPermissionsDenied: () => void;   // 권한이 거부되었을 때 호출
}

/**
 * PermissionManager 컴포넌트 메인 함수
 * 
 * @param props - 컴포넌트 Props
 * @returns JSX.Element
 */
export default function PermissionManager({ onPermissionsGranted, onPermissionsDenied }: PermissionManagerProps) {
  // 상태 관리
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * 컴포넌트 마운트 시 권한 상태 확인
   */
  useEffect(() => {
    checkPermissions();
  }, []);

  /**
   * 현재 권한 상태를 확인하는 함수
   * 카메라와 마이크 권한의 현재 상태를 가져와서 상태를 업데이트합니다.
   */
  const checkPermissions = async () => {
    try {
      // 카메라 권한 확인
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.granted);

      // 오디오 권한 확인
      const audioStatus = await Audio.getPermissionsAsync();
      setAudioPermission(audioStatus.granted);

      // 모든 권한이 허용된 경우
      if (cameraStatus.granted && audioStatus.granted) {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('권한 확인 실패:', error);
    }
  };

  const requestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      // 카메라 권한 요청
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraResult.granted);

      // 오디오 권한 요청
      const audioResult = await Audio.requestPermissionsAsync();
      setAudioPermission(audioResult.granted);

      if (cameraResult.granted && audioResult.granted) {
        onPermissionsGranted();
      } else {
        // 권한이 거부된 경우
        Alert.alert(
          '권한 필요',
          '카메라와 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [
            { text: '취소', onPress: onPermissionsDenied },
            { text: '설정으로 이동', onPress: () => {
              // 설정 앱으로 이동하는 로직 (플랫폼별로 다름)
              console.log('설정 앱으로 이동');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRequesting(false);
    }
  };

  const getPermissionStatus = () => {
    if (cameraPermission === null || audioPermission === null) {
      return 'checking';
    }
    if (cameraPermission && audioPermission) {
      return 'granted';
    }
    return 'denied';
  };

  const status = getPermissionStatus();

  if (status === 'granted') {
    return null; // 권한이 허용된 경우 컴포넌트를 렌더링하지 않음
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-4">
          <Ionicons name="camera" size={40} color="#3B82F6" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          권한이 필요합니다
        </Text>
        <Text className="text-gray-600 text-center leading-6">
          대화를 위해 카메라와 마이크 권한이 필요합니다.{'\n'}
          안전하게 사용되며, 대화 내용은 저장되지 않습니다.
        </Text>
      </View>

      <View className="w-full space-y-4">
        {/* 카메라 권한 상태 */}
        <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="camera" size={24} color="#6B7280" />
            <Text className="ml-3 text-gray-700">카메라</Text>
          </View>
          <View className="flex-row items-center">
            {cameraPermission === null ? (
              <Ionicons name="time" size={20} color="#9CA3AF" />
            ) : cameraPermission ? (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            )}
          </View>
        </View>

        {/* 마이크 권한 상태 */}
        <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="mic" size={24} color="#6B7280" />
            <Text className="ml-3 text-gray-700">마이크</Text>
          </View>
          <View className="flex-row items-center">
            {audioPermission === null ? (
              <Ionicons name="time" size={20} color="#9CA3AF" />
            ) : audioPermission ? (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            )}
          </View>
        </View>
      </View>

      {/* 권한 요청 버튼 */}
      <TouchableOpacity
        onPress={requestPermissions}
        disabled={isRequesting}
        className={`w-full mt-8 py-4 rounded-lg ${
          isRequesting ? 'bg-gray-300' : 'bg-blue-500'
        }`}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {isRequesting ? '권한 요청 중...' : '권한 허용하기'}
        </Text>
      </TouchableOpacity>

      {/* 취소 버튼 */}
      <TouchableOpacity
        onPress={onPermissionsDenied}
        disabled={isRequesting}
        className="mt-4"
      >
        <Text className="text-gray-500 text-center">
          나중에 하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
