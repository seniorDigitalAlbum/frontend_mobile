import { View, Text, SafeAreaView, Alert, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AICharacter from '../components/AICharacter';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';
import StartButton from '../components/StartButton';
import { useUser } from '../contexts/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MicrophoneTest'>;

export default function MicrophoneTest({ route, navigation }: Props) {
    const { 
        questionText, 
        questionId, 
        conversationId, 
        cameraSessionId, 
        microphoneSessionId 
    } = route.params || { questionText: '질문이 없습니다.' };
    
    const { user } = useUser();
    const userId = user?.userId || "1";
    
    const [isMicTested, setIsMicTested] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioLevelAnimation = useRef(new Animated.Value(0)).current;
    const characterAnimation = useRef(new Animated.Value(-200)).current;
    const [speechBubbleText, setSpeechBubbleText] = useState("마이크를 테스트할게요.\n마이크를 눌러주세요.");

    useEffect(() => {
        // AI 캐릭터가 왼쪽에서 슬라이드 인
        Animated.timing(characterAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();

        return () => {
            if (recordingRef.current) {
                try {
                    recordingRef.current.stopAndUnloadAsync();
                } catch (error) {
                    console.log('Recording already unloaded');
                }
            }
        };
    }, []);

    const handleStart = async () => {
        try {
            // 대화 세션 시작
            const startResponse = await conversationApiService.startConversation({
                userId: userId,
                questionId: questionId || 1
            });

            console.log('대화 세션 시작됨:', startResponse);

            // Conversation 화면으로 이동
            navigation.navigate('Conversation', {
                questionText: questionText,
                questionId: questionId,
                conversationId: startResponse.conversationId,
                cameraSessionId: startResponse.cameraSessionId,
                microphoneSessionId: startResponse.microphoneSessionId,
                userId: userId
            });
        } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            Alert.alert('오류', '대화를 시작할 수 없습니다. 다시 시도해주세요.');
        }
    };

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

            // 녹음 시작
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            recordingRef.current = recording;
            setIsRecording(true);

            // 실시간 오디오 레벨 모니터링 (시뮬레이션)
            const interval = setInterval(() => {
                const level = Math.random() * 0.8 + 0.2;
                setAudioLevel(level);
                
                Animated.timing(audioLevelAnimation, {
                    toValue: level,
                    duration: 100,
                    useNativeDriver: false,
                }).start();
            }, 100);

            // 3초 후 자동으로 녹음 중지
            setTimeout(async () => {
                if (recordingRef.current) {
                    try {
                        await recordingRef.current.stopAndUnloadAsync();
                    } catch (error) {
                        console.log('Recording already stopped');
                    }
                    setIsRecording(false);
                    setAudioLevel(0);
                    audioLevelAnimation.setValue(0);
                    clearInterval(interval);
                    
            // 마이크 세션 상태를 ACTIVE로 업데이트
            if (microphoneSessionId) {
                await microphoneApiService.updateSessionStatus(microphoneSessionId, 'ACTIVE');
                console.log('마이크 세션 상태가 ACTIVE로 업데이트됨');
            }
            setIsMicTested(true);
                    setSpeechBubbleText("마이크 테스트 완료!");
                }
            }, 3000);

        } catch (error) {
            console.error('마이크 테스트 시작 실패:', error);
            setIsRecording(false);
        }
    };

    const canStart = isMicTested;

    return (
        <SafeAreaView className="flex-1 bg-gray-800">
            {/* AI 캐릭터와 말풍선 - 왼쪽에서 슬라이드 인 */}
            <Animated.View 
                className="absolute top-20 left-4 z-10"
                style={{
                    transform: [{ translateX: characterAnimation }]
                }}
            >
                <View className="flex-row items-start">
                    <AICharacter />
                    
                    {/* 말풍선 */}
                    <View className="ml-4 mt-8">
                        <View className="bg-white rounded-2xl px-4 py-3 shadow-lg max-w-48">
                            <Text className="text-gray-800 text-sm font-medium leading-5">
                                {speechBubbleText}
                </Text>
            </View>
                        {/* 말풍선 꼬리 */}
                        <View 
                            className="absolute -left-2 top-6 w-0 h-0"
                            style={{
                                borderTopWidth: 8,
                                borderBottomWidth: 8,
                                borderRightWidth: 12,
                                borderTopColor: 'transparent',
                                borderBottomColor: 'transparent',
                                borderRightColor: 'white',
                            }}
                        />
                    </View>
                </View>
            </Animated.View>

            {/* 메인 컨텐츠 */}
            <View className="flex-1 justify-center items-center px-6">
                {/* 마이크 아이콘 - 화면 중앙에 크게 */}
                <View className="items-center mb-8">
                    <TouchableOpacity 
                        onPress={startMicTest}
                        disabled={isRecording || isMicTested}
                        className={`w-40 h-40 rounded-full justify-center items-center ${
                            isRecording ? 'bg-red-100' : isMicTested ? 'bg-green-100' : 'bg-blue-100'
                        }`}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={isRecording ? "stop" : isMicTested ? "checkmark-circle" : "mic"} 
                            size={80} 
                            color={isRecording ? "#EF4444" : isMicTested ? "#10B981" : "#3B82F6"} 
                        />
                        
                        {/* 실시간 오디오 레벨 표시 */}
                        {isRecording && (
                            <View className="absolute -bottom-12 left-0 right-0 items-center">
                                <View className="flex-row items-end space-x-2 h-12">
                                    {[...Array(5)].map((_, index) => (
                                        <Animated.View
                                            key={index}
                                            className="w-2 bg-red-500 rounded-full"
                                            style={{
                                                height: audioLevelAnimation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [8, 48],
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
                    
                    {isRecording && (
                        <Text className="text-sm text-red-400 mt-4">
                            {Math.round(audioLevel * 100)}%
                        </Text>
                    )}
                </View>

                {/* 시작하기 버튼 */}
                {isMicTested && (
                    <View className="items-center mt-8">
                        <TouchableOpacity
                        onPress={handleStart}
                            className="bg-blue-500 px-8 py-3 rounded-full"
                        >
                            <Text className="text-white text-lg font-bold">시작하기</Text>
                        </TouchableOpacity>
                </View>
                )}
            </View>
        </SafeAreaView>
    );
}
