import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import microphoneApiService from '../services/api/microphoneApiService';

interface AnswerMicProps {
    questionId: string;
    microphoneSessionId?: string;
    cameraSessionId?: string;
    conversationId?: string;
    userId?: string;
    onRecordingComplete?: (audioUri: string, questionId: string) => void;
    onRecordingStart?: (questionId: string) => void;
    onAIResponse?: (aiResponse: string, audioBase64?: string, conversationMessageId?: number) => void;
    maxDuration?: number; // 최대 녹음 시간 (초)
}

export default function AnswerMic({ 
    questionId,
    microphoneSessionId,
    cameraSessionId,
    conversationId,
    userId,
    onRecordingComplete, 
    onRecordingStart,
    onAIResponse,
    maxDuration = 120 
}: AnswerMicProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const durationRef = useRef<NodeJS.Timeout | null>(null);
    const audioLevelAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
            if (durationRef.current) {
                clearInterval(durationRef.current);
            }
        };
    }, []);

    // 오디오 파일을 Base64로 변환하는 함수
    const convertAudioToBase64 = async (uri: string): Promise<string> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    // data:audio/wav;base64, 부분을 제거하고 순수 Base64만 반환
                    const base64Data = base64.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('오디오 Base64 변환 실패:', error);
            throw error;
        }
    };

    const startRecording = async () => {
        try {
            // 오디오 권한 요청
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '마이크 권한이 필요합니다.');
                return;
            }

            // 오디오 모드 설정
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // 플랫폼별 녹음 설정
            let recordingOptions;
            
            if (Platform.OS === 'web') {
                // 웹 환경: WebM 형식 사용 (모든 플랫폼 설정 포함)
                recordingOptions = {
                    web: {
                        mimeType: 'audio/webm;codecs=opus',
                        bitsPerSecond: 128000,
                    },
                    android: {
                        extension: '.wav',
                        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                        sampleRate: 8000,
                        numberOfChannels: 1,
                        bitRate: 32000,
                    },
                    ios: {
                        extension: '.wav',
                        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
                        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
                        sampleRate: 8000,
                        numberOfChannels: 1,
                        bitRate: 32000,
                        linearPCMBitDepth: 16,
                        linearPCMIsBigEndian: false,
                        linearPCMIsFloat: false,
                    },
                };
            } else {
                // 모바일 환경: 압축된 WAV 형식 사용
                recordingOptions = {
                    android: {
                        extension: '.wav',
                        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                        sampleRate: 8000, // 낮은 샘플레이트
                        numberOfChannels: 1,
                        bitRate: 32000, // 낮은 비트레이트
                    },
                    ios: {
                        extension: '.wav',
                        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
                        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
                        sampleRate: 8000, // 낮은 샘플레이트
                        numberOfChannels: 1,
                        bitRate: 32000, // 낮은 비트레이트
                        linearPCMBitDepth: 16,
                        linearPCMIsBigEndian: false,
                        linearPCMIsFloat: false,
                    },
                };
            }

            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            
            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);
            
            console.log('🎤 녹음 시작됨 - duration timer 시작');

            // 발화 시작 API 호출
            if (microphoneSessionId && cameraSessionId) {
                try {
                    const speechStartResponse = await microphoneApiService.startSpeech({
                        userId: "1",
                        microphoneSessionId: microphoneSessionId,
                        cameraSessionId: cameraSessionId
                    });
                    console.log('발화 시작됨:', speechStartResponse);
                } catch (error) {
                    console.error('발화 시작 실패:', error);
                }
            }
            
            // 녹음 시작 콜백
            if (onRecordingStart) {
                onRecordingStart(questionId);
            }

            // 녹음 시간 카운터
            durationRef.current = setInterval(() => {
                setRecordingDuration(prev => {
                    const newDuration = prev + 1;
                    console.log(`⏱️ 녹음 시간: ${newDuration}초 / ${maxDuration}초`);
                    // 최대 시간 도달 시 자동 중지
                    if (newDuration >= maxDuration) {
                        console.log('⏱️ 최대 시간 도달 - 자동 중지');
                        stopRecording();
                        return maxDuration;
                    }
                    return newDuration;
                });
            }, 1000);

            // 실시간 오디오 레벨 모니터링 (시뮬레이션)
            const audioInterval = setInterval(() => {
                if (isRecording) {
                    const level = Math.random() * 0.8 + 0.2;
                    setAudioLevel(level);
                    
                    Animated.timing(audioLevelAnimation, {
                        toValue: level,
                        duration: 100,
                        useNativeDriver: false,
                    }).start();
                }
            }, 100);

            // 컴포넌트 언마운트 시 정리
            return () => clearInterval(audioInterval);

        } catch (error) {
            console.error('녹음 시작 실패:', error);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        console.log('🛑 stopRecording 호출됨');
        if (!recordingRef.current) {
            console.log('🛑 recordingRef가 null - 녹음이 이미 종료됨');
            return;
        }

        try {
            console.log('🛑 녹음 종료 중...');
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            console.log('🛑 녹음 파일 URI:', uri);
            
            setIsRecording(false);
            setAudioLevel(0);
            audioLevelAnimation.setValue(0);
            
            if (durationRef.current) {
                clearInterval(durationRef.current);
                durationRef.current = null;
                console.log('🛑 duration timer 정리됨');
            }

            // 발화 종료 API 호출
            if (microphoneSessionId && cameraSessionId && uri) {
                try {
                    // 오디오 파일을 Base64로 변환
                    const audioBase64 = await convertAudioToBase64(uri);
                    
                    const speechEndResponse = await microphoneApiService.endSpeech({
                        microphoneSessionId: microphoneSessionId,
                        cameraSessionId: cameraSessionId,
                        userId: "1",
                        conversationId: conversationId,
                        audioData: audioBase64 // Base64로 변환된 오디오 데이터
                    });
                    console.log('발화 종료됨:', speechEndResponse);
                    
                    // AI 응답을 부모 컴포넌트로 전달
                    if (speechEndResponse && speechEndResponse.status === 'success' && onAIResponse) {
                        onAIResponse(speechEndResponse.userText, '', speechEndResponse.conversationMessageId);
                    }
                } catch (error) {
                    console.error('발화 종료 실패:', error);
                }
            }

            // 녹음 완료 콜백
            if (uri && onRecordingComplete) {
                onRecordingComplete(uri, questionId);
            }

            recordingRef.current = null;

        } catch (error) {
            console.error('녹음 중지 실패:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <View className="items-center">
            <TouchableOpacity 
                onPress={handlePress}
                className={`w-20 h-20 rounded-full justify-center items-center ${
                    isRecording ? 'bg-red-100' : 'bg-blue-100'
                }`}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={isRecording ? "stop" : "mic"} 
                    size={32} 
                    color={isRecording ? "#EF4444" : "#3B82F6"} 
                />
                
                {/* 실시간 오디오 레벨 표시 */}
                {isRecording && (
                    <View className="absolute -bottom-6 left-0 right-0 items-center">
                        <View className="flex-row items-end space-x-1 h-6">
                            {[...Array(4)].map((_, index) => (
                                <Animated.View
                                    key={index}
                                    className="w-1 bg-red-500 rounded-full"
                                    style={{
                                        height: audioLevelAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [2, 16],
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
            
            {/* 녹음 상태 텍스트 */}
            {/* <Text className={`text-sm font-medium mt-2 ${
                isRecording ? 'text-red-700' : 'text-blue-700'
            }`}>
                {isRecording ? `녹음 중 ${formatTime(recordingDuration)}` : '답변 녹음'}
            </Text> */}

            {/* 최대 시간 표시 */}
            {/* {isRecording && (
                <Text className="text-xs text-gray-500 mt-1">
                    최대 {formatTime(maxDuration)}
                </Text>
            )} */}
        </View>
    );
}
