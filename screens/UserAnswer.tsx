import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import HiddenCamera from '../components/HiddenCamera';
import TempMicTest from '../components/TempMicTest';
import AnswerMic from '../components/AnswerMic';
import NextButton from '../components/NextButton';
import EndChatButton from '../components/EndChatButton';
import { useState, useEffect } from 'react';
import ttsService from '../services/audio/ttsService';
import sttService from '../services/audio/sttService';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'UserAnswer'>;

export default function UserAnswer({ route, navigation }: Props) {
    const { 
        questionText, 
        questionId, 
        conversationId, 
        cameraSessionId, 
        microphoneSessionId 
    } = route.params || { questionText: '질문이 없습니다.' };
    const [isMicTested, setIsMicTested] = useState(false);
    const [hasAnswerRecording, setHasAnswerRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);

    const handleNext = () => {
        // AI가 새로운 질문을 하는 화면으로 이동
        navigation.navigate('AIChat', { 
            questionText: '새로운 질문입니다.',
            questionId,
            conversationId,
            cameraSessionId,
            microphoneSessionId
        });
    };

    const handleEndChat = async () => {
        // 발화 종료 API 호출
        if (microphoneSessionId && cameraSessionId) {
            try {
                const userId = 'user-123'; // 실제로는 로그인된 사용자 ID 사용
                const speechEndResult = await microphoneApiService.endSpeech(
                    microphoneSessionId,
                    cameraSessionId,
                    userId
                );
                console.log('발화 종료됨:', speechEndResult);
            } catch (error) {
                console.error('발화 종료 실패:', error);
            }
        }
        
        // 마이크 세션 종료
        if (microphoneSessionId) {
            try {
                await microphoneApiService.endSession(microphoneSessionId);
                console.log('마이크 세션 종료됨:', microphoneSessionId);
            } catch (error) {
                console.error('마이크 세션 종료 실패:', error);
            }
        }
        
        // 대화 세션 종료
        if (conversationId) {
            try {
                await conversationApiService.endConversation(conversationId);
                console.log('대화 세션 종료됨:', conversationId);
            } catch (error) {
                console.error('대화 세션 종료 실패:', error);
            }
        }
        
        // 채팅 화면으로 이동하면서 대화 내용 전달
        navigation.navigate('Chat', { 
            chatHistory: [
                {
                    id: 1,
                    type: 'ai',
                    message: questionText,
                    timestamp: new Date().toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                },
                {
                    id: 2,
                    type: 'user',
                    message: transcribedText || '사용자의 답변 내용입니다.',
                    timestamp: new Date().toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                }
            ]
        });
    };

    const handleMicTest = () => {
        setIsMicTested(true);
    };

    const handleAnswerRecordingComplete = async (audioUri: string, questionId: string) => {
        console.log(`답변 녹음 완료 - 질문 ID: ${questionId}, 오디오 URI: ${audioUri}`);
        
        try {
            // 마이크 세션 상태를 RECORDING으로 업데이트
            if (microphoneSessionId) {
                await microphoneApiService.updateSessionStatus(microphoneSessionId, 'RECORDING');
                console.log('마이크 세션 상태가 RECORDING으로 업데이트됨');
            }
            
            // AnswerMic에서 녹음한 오디오를 STT로 변환
            const sttResult = await sttService.transcribeAudioFromUri(audioUri);
            if (sttResult && sttResult.text) {
                setTranscribedText(sttResult.text);
                console.log('STT 변환 결과:', sttResult.text);
                
                // 사용자 답변 메시지 저장
                if (conversationId && sttResult.text) {
                    try {
                        await conversationApiService.saveUserMessage(conversationId, sttResult.text);
                        console.log('사용자 답변 메시지 저장됨:', sttResult.text);
                    } catch (error) {
                        console.error('사용자 답변 메시지 저장 실패:', error);
                    }
                }
            } else {
                console.log('STT 변환 실패');
            }
        } catch (error) {
            console.error('STT 변환 중 오류:', error);
        }
        
        setHasAnswerRecording(true);
    };

    const handleAnswerRecordingStart = async (questionId: string) => {
        console.log(`답변 녹음 시작 - 질문 ID: ${questionId}`);
        setIsRecording(true);
    };

    // TTS로 질문 읽기
    const handlePlayQuestion = async () => {
        if (isPlaying) {
            await ttsService.stopAudio();
            setIsPlaying(false);
            return;
        }

        try {
            setIsPlaying(true);
            const ttsResult = await ttsService.synthesizeText(questionText);
            
            if (ttsResult && ttsResult.audioData) {
                await ttsService.playAudio(ttsResult.audioData, ttsResult.format, volume);
            } else {
                console.error('TTS 변환 실패');
                setIsPlaying(false);
            }
        } catch (error) {
            console.error('질문 재생 실패:', error);
            setIsPlaying(false);
        }
    };

    // 컴포넌트 마운트 시 STT 서비스 상태 확인
    useEffect(() => {
        const checkSTTHealth = async () => {
            try {
                const isHealthy = await sttService.checkHealth();
                console.log('STT 서비스 상태:', isHealthy ? '정상' : '오류');
            } catch (error) {
                console.error('STT 서비스 상태 확인 실패:', error);
            }
        };
        
        checkSTTHealth();
        
        return () => {
            ttsService.destroy();
            sttService.cleanup();
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 메인 컨텐츠 */}
            <View className="flex-1 p-6">
                {/* 숨겨진 카메라 (실시간 이미지 전송) */}
                <HiddenCamera 
                    onFaceDetected={(imageData) => {
                        // AI 서버로 이미지 데이터만 전송 (AI가 감정 분석)
                        //console.log('이미지 데이터 AI 서버 전송:', imageData);
                    }}
                />

                {/* 캐릭터와 질문 */}
                <View className="flex-1 justify-center items-center mb-8">
                    {/* 캐릭터 */}
                    <TouchableOpacity 
                        onPress={handlePlayQuestion}
                        className="w-32 h-32 bg-blue-100 rounded-full justify-center items-center mb-6"
                        activeOpacity={0.7}
                    >
                        <Text className="text-4xl">🤖</Text>
                        {/* 재생/정지 표시 */}
                        <View className="absolute bottom-2 right-2">
                            <Text className="text-lg">
                                {isPlaying ? '⏹️' : '▶️'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    
                    {/* 말풍선 */}
                    <View className="bg-gray-100 rounded-2xl p-4 mx-4 mb-8 relative">
                        {/* 말풍선 꼬리 */}
                        <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <View className="w-4 h-4 bg-gray-100 rotate-45"></View>
                        </View>
                        <Text className="text-lg text-center text-gray-800 leading-6">
                            {questionText}
                        </Text>
                    </View>
                </View>

                {/* 답변 녹음 */}
                <View className="items-center mb-8">
                    <AnswerMic 
                        questionId={questionId || `question-${Date.now()}`}
                        microphoneSessionId={microphoneSessionId}
                        onRecordingComplete={handleAnswerRecordingComplete}
                        onRecordingStart={handleAnswerRecordingStart}
                        maxDuration={10} // 10초로 단축
                    />
                    
                    {/* 녹음 상태 표시 */}
                    {isRecording && (
                        <View className="mt-4 bg-red-100 px-4 py-2 rounded-full">
                            <Text className="text-red-600 font-medium">🎤 녹음 중...</Text>
                        </View>
                    )}
                    
                    {/* STT 변환 결과 표시 (디버깅용) */}
                    {transcribedText && (
                        <View className="mt-4 bg-green-100 p-3 rounded-lg max-w-sm">
                            <Text className="text-green-800 text-sm">
                                변환된 텍스트: {transcribedText}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 버튼들 */}
                <View className="w-full">
                    <View className="mb-2">
                        <NextButton onPress={handleNext} />
                    </View>
                    <EndChatButton onPress={handleEndChat} />
                </View>
            </View>
        </SafeAreaView>
    );
} 