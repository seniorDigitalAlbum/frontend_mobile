import { View, SafeAreaView, Text, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import HiddenCamera from '../components/HiddenCamera';
import AIQuestionSection from '../components/AIQuestionSection';
import UserAnswerSection from '../components/UserAnswerSection';
import sttService from '../services/audio/sttService';
import ttsService from '../services/audio/ttsService';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';
import ttsApiService from '../services/api/ttsApiService';
import gptApiService from '../services/api/gptApiService';
import { sendFacialEmotionAnalysis } from '../services/api/emotionApiService';
import conversationContextApiService from '../services/api/conversationContextApiService';
import kobertApiService from '../services/api/kobertApiService';
import speechEmotionApiService from '../services/api/speechEmotionApiService';
import combinedEmotionApiService from '../services/api/combinedEmotionApiService';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export default function Conversation({ route, navigation }: Props) {
    const { settings } = useAccessibility();
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
    
    // console.log('Conversation.tsx - route.params:', route.params);
    // console.log('Conversation.tsx - questionText:', questionText);
    // console.log('Conversation.tsx - safeQuestionText:', safeQuestionText);
    
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [isQuestionComplete, setIsQuestionComplete] = useState(false);
    const [currentQuestionText, setCurrentQuestionText] = useState(safeQuestionText);
    const [originalQuestionText] = useState(safeQuestionText); // 원본 질문 텍스트 보관
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [hasAIResponse, setHasAIResponse] = useState(false);
    const [emotionCaptures, setEmotionCaptures] = useState<Array<{
        timestamp: string;
        emotion: string;
        confidence: number;
    }>>([]);
    const [isQuestionTTSPlayed, setIsQuestionTTSPlayed] = useState(false);

    // AI 질문 메시지 저장 (임시 비활성화 - 백엔드 엔드포인트 없음)
    useEffect(() => {
        const initializeQuestion = async () => {
            if (conversationId && safeQuestionText && !isQuestionTTSPlayed) {
                try {
                    // AI 질문 메시지 저장 (임시 비활성화)
                    // await conversationApiService.saveAIMessage(conversationId, safeQuestionText);
                    console.log('AI 질문 메시지 저장됨:', safeQuestionText);
                    setIsQuestionTTSPlayed(true);
                    // TTS 재생이 완료된 후에 마이크 버튼이 보이도록 하기 위해 여기서는 isQuestionComplete를 설정하지 않음
                } catch (error) {
                    console.error('질문 초기화 실패:', error);
                }
            }
        };
        
        initializeQuestion();
    }, [conversationId, safeQuestionText, isQuestionTTSPlayed]);

    // STT 서비스 정리
    useEffect(() => {
        return () => {
            sttService.cleanup();
        };
    }, []);

    const handleQuestionComplete = () => {
        console.log('🎵 TTS 재생 완료 - 마이크 버튼 표시');
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
                
                if (endResponse && endResponse.status === 'COMPLETED') {
                    // 일기 생성 로딩 화면으로 이동
                    navigation.navigate('DiaryLoading');
                    
                    // 백그라운드에서 처리 상태 확인 및 일기 조회
                    await checkProcessingAndGetDiary(conversationId);
                }
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
                            userId: "1",
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
    };

    const handleAIResponse = async (userText: string, audioBase64?: string, conversationMessageId?: number) => {
        console.log('사용자 발화 텍스트 받음:', userText);
        console.log('conversationMessageId 받음:', conversationMessageId);
        try {
            setIsProcessingResponse(true);
            
            // 사용자 발화 텍스트 저장
            setTranscribedText(userText);
            
            // 감정 분석 결과 전송 (실제 conversationMessageId 사용)
            if (emotionCaptures.length > 0 && conversationMessageId) {
                const emotionCounts = emotionCaptures.reduce((acc, capture) => {
                    acc[capture.emotion] = (acc[capture.emotion] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const averageConfidence = emotionCaptures.reduce((sum, capture) => sum + capture.confidence, 0) / emotionCaptures.length;
                const finalEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);

                console.log('감정 분석 결과 전송 - conversationMessageId:', conversationMessageId);
                
                try {
                    await sendFacialEmotionAnalysis({
                        conversationMessageId: conversationMessageId,
                        finalEmotion,
                        totalCaptures: emotionCaptures.length,
                        emotionCounts,
                        averageConfidence,
                        captureDetails: emotionCaptures
                    });
                    console.log('표정 감정 분석 저장 완료');
                    
                    // 표정 감정 분석 저장 완료 후 KoBERT 플로우 실행
                    await executeKoBERTFlow(conversationMessageId, userText);
                } catch (error) {
                    console.error('❌ 표정 감정 분석 저장 실패:', error);
                    // 표정 감정 분석 저장 실패 시에도 KoBERT 플로우 실행
                    await executeKoBERTFlow(conversationMessageId, userText);
                }
            } else {
                // 표정 감정 분석 데이터가 없는 경우에도 KoBERT 플로우 실행
                if (conversationMessageId) {
                    await executeKoBERTFlow(conversationMessageId, userText);
                }
            }

            // GPT 답변 생성 (실제 conversationMessageId 사용)
            if (conversationMessageId) {
                const gptResponse = await gptApiService.generateResponse({
                    conversationMessageId: conversationMessageId
                });

                if (gptResponse) {
                    // AI 응답으로 질문 텍스트 업데이트
                    setCurrentQuestionText(gptResponse.aiResponse);
                    setHasAIResponse(true);
                    setIsQuestionComplete(false);

                    // AI 응답 TTS 재생 (안전하게 처리)
                    try {
                        console.log('🎵 TTS 요청 시작:', gptResponse.aiResponse);
                        const ttsResponse = await ttsApiService.synthesize({
                            text: gptResponse.aiResponse,
                            voice: 'ko-KR-Wavenet-A',
                            speed: 1.0,
                            pitch: 0.0,
                            volume: 0.0,
                            format: 'MP3'
                        });

                        if (ttsResponse.status === 'success' && ttsResponse.audioData) {
                            await ttsService.playAudio(ttsResponse.audioData, 'mp3');
                            console.log('🎵 AI 응답 TTS 재생 완료 - 마이크 다시 활성화');
                        } else {
                            console.error('❌ TTS 응답이 유효하지 않음:', ttsResponse);
                        }
                    } catch (error) {
                        console.error('AI 응답 TTS 재생 실패:', error);
                    }
                }
                
                // AI 응답을 받았음을 표시
                setHasAIResponse(true);
                
                // TTS 재생 완료 후 마이크 상태 초기화 (새로운 답변을 받을 수 있도록)
                setTranscribedText('');
                setEmotionCaptures([]);
                setIsQuestionComplete(true); // 마이크 버튼을 다시 활성화
            }
            
        } catch (error) {
            console.error('AI 응답 처리 중 오류:', error);
        } finally {
            setIsProcessingResponse(false);
        }
    };

    // KoBERT 플로우 실행 함수
    const executeKoBERTFlow = async (conversationMessageId: number, userText: string) => {
        try {
            console.log('🔄 KoBERT 플로우 시작 - conversationMessageId:', conversationMessageId);

            // 1. 대화 컨텍스트 조회
            const contextResponse = await conversationContextApiService.getContext(conversationMessageId);
            console.log('📝 대화 컨텍스트 조회 완료:', contextResponse);

            // 2. KoBERT 감정 분석
            const kobertResponse = await kobertApiService.predictEmotion({
                prev_user: contextResponse.prevUser || "",
                prev_sys: contextResponse.prevSys || "",
                curr_user: contextResponse.currUser || ""
            });
            console.log('KoBERT 감정 분석 완료:', kobertResponse);

            // all_probabilities에서 가장 높은 값 찾기
            const allProbabilities = kobertResponse.all_probabilities;
            const maxEmotion = Object.keys(allProbabilities).reduce((a, b) => 
                allProbabilities[a as keyof typeof allProbabilities] > allProbabilities[b as keyof typeof allProbabilities] ? a : b
            );
            const maxConfidence = allProbabilities[maxEmotion as keyof typeof allProbabilities];

            // 3. 음성 감정 분석 저장
            const speechEmotionData = {
                text: userText,
                analysisResult: {
                    emotion: maxEmotion,
                    confidence: maxConfidence,
                    details: kobertResponse
                }
            };
            
            const speechEmotionResponse = await speechEmotionApiService.saveSpeechEmotion({
                conversationMessageId: conversationMessageId,
                emotion: maxEmotion,
                confidence: maxConfidence,
                speechEmotionData: JSON.stringify(speechEmotionData)
            });
            console.log('음성 감정 분석 저장 완료:', speechEmotionResponse);

            // 4. 통합 감정 분석 실행
            try {
                console.log('통합 감정 분석 시작 - conversationMessageId:', conversationMessageId);
                console.log('표정 감정 캡처 수:', emotionCaptures.length);
                const combinedEmotionResponse = await combinedEmotionApiService.combineEmotions({
                    conversationMessageId: conversationMessageId
                });
                console.log('통합 감정 분석 완료:', combinedEmotionResponse);
            } catch (error) {
                console.error('통합 감정 분석 실패:', error);
                console.log('표정 감정과 말 감정이 모두 저장되었는지 확인해주세요.');
            }

        } catch (error) {
            console.error('KoBERT 플로우 실행 중 오류:', error);
        }
    };

    const handleAnswerRecordingStart = async (questionId: string) => {
        console.log(`답변 녹음 시작 - 질문 ID: ${questionId}`);
        setIsRecording(true);
    };


    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 숨겨진 카메라 (실시간 이미지 전송) */}
            <HiddenCamera 
                isRecording={isRecording}
                onFaceDetected={(imageData) => {
                    // HiddenCamera에서 이미 감정 분석이 완료된 결과를 받음
                    console.log('📸 이미지 감정 분석 결과 수신:', imageData);
                    
                    if (imageData.emotionResult && imageData.emotionResult.success && isRecording) {
                        const newCapture = {
                            timestamp: imageData.timestamp,
                            emotion: imageData.emotionResult.emotion,
                            confidence: imageData.emotionResult.confidence
                        };
                        
                        setEmotionCaptures(prev => [...prev, newCapture]);
                        console.log('감정 캡처 추가됨:', newCapture);
                    }
                }}
                onRecordingStart={() => {
                    console.log('HiddenCamera: 녹음 시작됨');
                    // 감정 캡처 초기화는 새로운 대화 시작 시에만 수행
                    // setEmotionCaptures([]); // 주석 처리
                }}
                onRecordingStop={() => {
                    console.log('HiddenCamera: 녹음 종료됨');
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
                                AI가 응답을 생성하고 있습니다...
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
                        conversationId={conversationId?.toString() || null}
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
