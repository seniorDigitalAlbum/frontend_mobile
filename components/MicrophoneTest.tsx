import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface MicrophoneTestProps {
  onTestPassed: () => void;
  onTestFailed: () => void;
}

export default function MicrophoneTest({ onTestPassed, onTestFailed }: MicrophoneTestProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTested, setIsTested] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    const { status } = await Audio.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startCountdown = () => {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      // 오디오 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);

      // 1초 후 녹음 중지
      setTimeout(() => {
        stopRecording();
      }, 1000);

    } catch (error) {
      console.error('녹음 시작 실패:', error);
      setTestResult('failed');
      setIsTested(true);
      Alert.alert('녹음 실패', '마이크 테스트에 실패했습니다.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      // 녹음된 파일 확인
      const uri = recording.getURI();
      if (uri) {
        setTestResult('success');
        setIsTested(true);
        
        // 테스트 성공 후 잠시 대기
        setTimeout(() => {
          onTestPassed();
        }, 1500);
      } else {
        throw new Error('녹음 파일이 생성되지 않았습니다');
      }

    } catch (error) {
      console.error('녹음 중지 실패:', error);
      setTestResult('failed');
      setIsTested(true);
      
      Alert.alert(
        '마이크 테스트 실패',
        '마이크가 정상적으로 작동하지 않습니다. 다시 시도해주세요.',
        [
          { text: '다시 시도', onPress: () => {
            setIsTested(false);
            setTestResult('pending');
            setCountdown(0);
          }},
          { text: '건너뛰기', onPress: onTestFailed }
        ]
      );
    }
  };

  const handleTestMicrophone = () => {
    if (isRecording || countdown > 0) return;
    startCountdown();
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">마이크 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Ionicons name="mic-off" size={80} color="#EF4444" />
        <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
          마이크 권한이 필요합니다
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          마이크 테스트를 위해 마이크 권한이 필요합니다.
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
    <View className="flex-1 justify-center items-center bg-white px-6">
      {/* 마이크 아이콘 */}
      <View className="items-center mb-8">
        <View className={`w-32 h-32 rounded-full justify-center items-center mb-6 ${
          isRecording ? 'bg-red-100' : countdown > 0 ? 'bg-yellow-100' : 'bg-blue-100'
        }`}>
          <Ionicons 
            name="mic" 
            size={60} 
            color={isRecording ? '#EF4444' : countdown > 0 ? '#F59E0B' : '#3B82F6'} 
          />
        </View>

        {/* 카운트다운 또는 상태 표시 */}
        {countdown > 0 ? (
          <Text className="text-4xl font-bold text-yellow-600 mb-2">
            {countdown}
          </Text>
        ) : isRecording ? (
          <Text className="text-2xl font-semibold text-red-600 mb-2">
            녹음 중...
          </Text>
        ) : isTested ? (
          <Text className={`text-2xl font-semibold mb-2 ${
            testResult === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {testResult === 'success' ? '테스트 완료!' : '테스트 실패'}
          </Text>
        ) : (
          <Text className="text-2xl font-semibold text-gray-800 mb-2">
            마이크 테스트
          </Text>
        )}

        <Text className="text-gray-600 text-center leading-6">
          {countdown > 0 
            ? '곧 녹음이 시작됩니다'
            : isRecording 
              ? '1초간 녹음 중입니다'
              : isTested
                ? testResult === 'success'
                  ? '마이크가 정상적으로 작동합니다'
                  : '마이크 테스트에 실패했습니다'
                : '버튼을 눌러 1초간 녹음 테스트를 시작하세요'
          }
        </Text>
      </View>

      {/* 테스트 결과 표시 */}
      {isTested && (
        <View className={`w-full p-4 rounded-lg mb-6 ${
          testResult === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <View className="flex-row items-center">
            <Ionicons 
              name={testResult === 'success' ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={testResult === 'success' ? '#10B981' : '#EF4444'} 
            />
            <Text className={`ml-3 font-semibold ${
              testResult === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult === 'success' ? '마이크 테스트 성공' : '마이크 테스트 실패'}
            </Text>
          </View>
        </View>
      )}

      {/* 테스트 버튼 */}
      <TouchableOpacity
        onPress={handleTestMicrophone}
        disabled={isRecording || countdown > 0 || isTested}
        className={`w-full py-4 rounded-lg ${
          isRecording 
            ? 'bg-red-500' 
            : countdown > 0 
              ? 'bg-yellow-500' 
              : isTested
                ? testResult === 'success'
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : 'bg-blue-500'
        }`}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {isRecording 
            ? '녹음 중...' 
            : countdown > 0 
              ? `${countdown}초 후 시작`
              : isTested
                ? testResult === 'success'
                  ? '테스트 완료'
                  : '테스트 실패'
                : '마이크 테스트 시작'
          }
        </Text>
      </TouchableOpacity>

      {/* 건너뛰기 버튼 */}
      {!isTested && (
        <TouchableOpacity
          onPress={onTestFailed}
          disabled={isRecording || countdown > 0}
          className="mt-4"
        >
          <Text className="text-gray-500 text-center">
            건너뛰기
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
