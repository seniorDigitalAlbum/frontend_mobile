import { View, SafeAreaView, Text, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import HiddenCamera from '../components/HiddenCamera';
import AIQuestionSection from '../components/AIQuestionSection';
import UserAnswerSection from '../components/UserAnswerSection';
import sttService from '../services/audio/sttService';
import ttsService from '../services/audio/ttsService';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export default function Conversation({ route, navigation }: Props) {
    const { 
        questionText, 
        questionId, 
        conversationId, 
        cameraSessionId, 
        microphoneSessionId
    } = route.params || {};
    
    // userId 하드코딩
    const userId = "1";
    
    // questionText가 null이거나 undefined인 경우 기본값 설정
    const safeQuestionText = questionText || '안녕하세요, 오늘 하루는 어떠셨나요?';
    
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [isQuestionComplete, setIsQuestionComplete] = useState(false);
    const [currentQuestionText, setCurrentQuestionText] = useState(safeQuestionText);
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [hasAIResponse, setHasAIResponse] = useState(false);

    // AI 질문 메시지 저장
    useEffect(() => {
        const saveAIMessage = async () => {
            if (conversationId && safeQuestionText) {
                try {
                    await conversationApiService.saveAIMessage(conversationId, safeQuestionText);
                    console.log('AI 질문 메시지 저장됨:', safeQuestionText);
                } catch (error) {
                    console.error('AI 질문 메시지 저장 실패:', error);
                }
            }
        };
        
        saveAIMessage();
    }, [conversationId, safeQuestionText]);

    // STT 서비스 상태 확인
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
            sttService.cleanup();
        };
    }, []);

    const handleQuestionComplete = () => {
        setIsQuestionComplete(true);
    };

    const handleNext = () => {
        // AI 응답을 받았을 때만 다음 화면으로 넘어가기
        if (hasAIResponse) {
            // 현재 화면에서 새로운 질문으로 계속 진행
            // AI 응답이 이미 currentQuestionText에 설정되어 있으므로
            // 질문 완료 상태만 리셋하여 새로운 질문이 표시되도록 함
            setIsQuestionComplete(false);
            setTranscribedText(null);
            setHasAIResponse(false); // AI 응답 상태 리셋
        } else {
            console.log('AI 응답을 아직 받지 못했습니다. 다음으로 넘어갈 수 없습니다.');
        }
    };

    const handleEndChat = async () => {
        try {
            // 대화 세션 종료 API 호출
            if (conversationId) {
                const endResponse = await conversationApiService.endConversation(conversationId);
                console.log('대화 세션 종료됨:', endResponse);
                
                // 일기 생성 로딩 화면으로 이동
                navigation.navigate('DiaryLoading');
                
                // 백그라운드에서 처리 상태 확인 및 일기 조회
                await checkProcessingAndGetDiary(conversationId);
            }
        } catch (error) {
            console.error('대화 종료 실패:', error);
            Alert.alert('오류', '대화를 종료할 수 없습니다. 다시 시도해주세요.');
        }
    };

    const checkProcessingAndGetDiary = async (conversationId: number) => {
        try {
            // 처리 상태 확인 (폴링)
            const checkStatus = async (): Promise<void> => {
                const statusResponse = await conversationApiService.getProcessingStatus(conversationId);
                
                if (statusResponse && !statusResponse.isProcessing) {
                    // 처리 완료 - 일기 조회
                    const diaryResponse = await conversationApiService.getDiary(conversationId);
                    
                    if (diaryResponse) {
                        // DiaryResult 화면으로 이동
                        navigation.navigate('DiaryResult', {
                            diary: diaryResponse.diary,
                            conversationId: diaryResponse.conversationId,
                            finalEmotion: diaryResponse.emotionSummary.dominantEmotion,
                            userId: '1',
                            musicRecommendations: diaryResponse.musicRecommendations
                        });
                    } else {
                        console.error('일기 조회 실패');
                        navigation.navigate('MainTabs' as never);
                    }
                } else {
                    // 아직 처리 중 - 2초 후 다시 확인
                    setTimeout(checkStatus, 2000);
                }
            };
            
            // 첫 번째 상태 확인 시작
            checkStatus();
        } catch (error) {
            console.error('일기 생성 처리 중 오류:', error);
            navigation.navigate('MainTabs' as never);
        }
    };

    const handleAnswerRecordingComplete = async (audioUri: string, questionId: string) => {
        console.log(`답변 녹음 완료 - 질문 ID: ${questionId}, 오디오 URI: ${audioUri}`);
        setIsRecording(false);
        // AnswerMic에서 발화 종료 API를 호출하므로 여기서는 상태만 업데이트
        // 실제 AI 응답 처리는 AnswerMic에서 받은 응답을 사용
    };

    const handleAIResponse = async (aiResponse: string, audioBase64?: string) => {
        console.log('AI 응답 받음:', aiResponse);
        try {
            setIsProcessingResponse(true);
            
            // AI 응답으로 질문 텍스트 업데이트
            setCurrentQuestionText(aiResponse);
            
            // AI 응답 TTS 재생
            if (audioBase64) {
                try {
                    await ttsService.playAudio(audioBase64, 'mp3');
                } catch (error) {
                    console.error('AI 응답 TTS 재생 실패:', error);
                }
            }
            
            // STT 변환 결과 표시 (디버깅용)
            setTranscribedText(aiResponse);
            
            // AI 응답을 받았음을 표시
            setHasAIResponse(true);
            
            // 질문 완료 상태 리셋하여 새로운 질문 표시
            setIsQuestionComplete(false);
        } catch (error) {
            console.error('AI 응답 처리 중 오류:', error);
        } finally {
            setIsProcessingResponse(false);
        }
    };

    const handleAnswerRecordingStart = async (questionId: string) => {
        console.log(`답변 녹음 시작 - 질문 ID: ${questionId}`);
        setIsRecording(true);
        // AnswerMic에서 발화 시작 API를 호출하므로 여기서는 상태만 업데이트
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 숨겨진 카메라 (실시간 이미지 전송) */}
            <HiddenCamera 
                onFaceDetected={(imageData) => {
                    // AI 서버로 이미지 데이터만 전송 (AI가 감정 분석)
                    //console.log('이미지 데이터 AI 서버 전송:', imageData);
                }}
            />

            {/* 메인 컨텐츠 */}
            <View className="flex-1 p-6">
                {/* AI 질문 섹션 */}
                <AIQuestionSection 
                    questionText={currentQuestionText}
                    onQuestionComplete={handleQuestionComplete}
                />

                {/* 처리 중 상태 표시 */}
                {isProcessingResponse && (
                    <View className="items-center mb-8">
                        <View className="bg-blue-100 px-6 py-4 rounded-full">
                            <Text className="text-blue-600 font-medium text-center">
                                🤖 AI가 응답을 생성하고 있습니다...
                            </Text>
                        </View>
                    </View>
                )}

                {/* 사용자 답변 섹션 */}
                {isQuestionComplete && !isProcessingResponse && (
                    <UserAnswerSection
                        questionId={questionId || 'default-question-id'}
                        microphoneSessionId={microphoneSessionId || null}
                        cameraSessionId={cameraSessionId || null}
                        conversationId={conversationId || null}
                        userId={userId || null}
                        onRecordingComplete={handleAnswerRecordingComplete}
                        onRecordingStart={handleAnswerRecordingStart}
                        onAIResponse={handleAIResponse}
                        onNext={handleNext}
                        onEndChat={handleEndChat}
                        transcribedText={transcribedText}
                        isRecording={isRecording}
                        isQuestionComplete={isQuestionComplete}
                        hasAIResponse={hasAIResponse}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
