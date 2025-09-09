import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface TempMicTestProps {
    isTested: boolean;
    onTest: () => void;
}

export default function TempMicTest({ isTested, onTest }: TempMicTestProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioLevelAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
        };
    }, []);

    const startMicTest = async () => {
        try {
            // 오디오 권한 요청
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('마이크 권한이 필요합니다');
                return;
            }

            // 오디오 모드 설정
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // 녹음 시작 (최신 API 사용)
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            recordingRef.current = recording;
            setIsRecording(true);

            // 실시간 오디오 레벨 모니터링 (시뮬레이션)
            const interval = setInterval(() => {
                // 실제 오디오 레벨 대신 시뮬레이션된 값 사용
                const level = Math.random() * 0.8 + 0.2;
                setAudioLevel(level);
                
                // 애니메이션 업데이트
                Animated.timing(audioLevelAnimation, {
                    toValue: level,
                    duration: 100,
                    useNativeDriver: false,
                }).start();
            }, 100);

            // 3초 후 자동으로 녹음 중지
            setTimeout(async () => {
                if (recordingRef.current) {
                    await recordingRef.current.stopAndUnloadAsync();
                    setIsRecording(false);
                    setAudioLevel(0);
                    audioLevelAnimation.setValue(0);
                    clearInterval(interval);
                    onTest(); // 테스트 완료 콜백
                }
            }, 3000);

        } catch (error) {
            console.error('마이크 테스트 시작 실패:', error);
            setIsRecording(false);
        }
    };

    const stopMicTest = async () => {
        if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            setIsRecording(false);
            setAudioLevel(0);
            audioLevelAnimation.setValue(0);
        }
    };

    const handlePress = () => {
        if (isRecording) {
            stopMicTest();
        } else if (!isTested) {
            startMicTest();
        }
    };

    return (
        <View className="items-center mb-4">
            <TouchableOpacity 
                onPress={handlePress}
                className={`w-24 h-24 rounded-full justify-center items-center ${
                    isRecording ? 'bg-red-100' : isTested ? 'bg-green-100' : 'bg-blue-100'
                }`}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={isRecording ? "stop" : isTested ? "checkmark-circle" : "mic"} 
                    size={40} 
                    color={isRecording ? "#EF4444" : isTested ? "#10B981" : "#3B82F6"} 
                />
                
                {/* 실시간 오디오 레벨 표시 (스테레오 바) */}
                {isRecording && (
                    <View className="absolute -bottom-8 left-0 right-0 items-center">
                        <View className="flex-row items-end space-x-1 h-8">
                            {[...Array(5)].map((_, index) => (
                                <Animated.View
                                    key={index}
                                    className="w-1 bg-red-500 rounded-full"
                                    style={{
                                        height: audioLevelAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [4, 24],
                                        }),
                                        opacity: audioLevelAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.3, 1],
                                        }),
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
            
            <Text className={`text-xs mt-2 font-medium ${
                isRecording ? 'text-red-700' : isTested ? 'text-green-700' : 'text-blue-700'
            }`}>
                {isRecording ? "" : isTested ? "완료" : "테스트"}
            </Text>
            
            {isRecording && (
                <Text className="text-xs text-red-600 mt-3">
                    {Math.round(audioLevel * 100)}%
                </Text>
            )}
        </View>
    );
} 