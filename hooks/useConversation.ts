import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import sttService from '../services/audio/sttService';
import ttsService from '../services/audio/ttsService';
import { ConversationService, EmotionCapture } from '../services/conversationService';
import { ConversationUtils } from '../utils/conversationUtils';

export interface UseConversationParams {
    questionText?: string;
    questionId?: string;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
}

export interface UseConversationReturn {
    // 상태
    isRecording: boolean;
    transcribedText: string | null;
    isQuestionComplete: boolean;
    currentQuestionText: string;
    isProcessingResponse: boolean;
    hasAIResponse: boolean;
    emotionCaptures: EmotionCapture[];
    isQuestionTTSPlayed: boolean;
    isCameraVisible: boolean;
    userId: string;
    questionId: string;
    conversationId: number | undefined;
    cameraSessionId: string | undefined;
    microphoneSessionId: string | undefined;
    
    // 함수
    handleQuestionComplete: () => void;
    handleEndChat: () => Promise<void>;
    handleAnswerRecordingComplete: (audioUri: string, questionId: string) => Promise<void>;
    handleAnswerRecordingStart: (questionId: string) => Promise<void>;
    handleAIResponse: (userText: string, audioBase64?: string, conversationMessageId?: number) => Promise<void>;
    handleShowAIMessage: () => void;
    handleShowCamera: () => void;
    setCurrentQuestionText: (text: string) => void;
    setTranscribedText: (text: string | null) => void;
    setEmotionCaptures: (captures: EmotionCapture[]) => void;
    addEmotionCapture: (capture: EmotionCapture) => void;
}

export const useConversation = (params: UseConversationParams): UseConversationReturn => {
    const navigation = useNavigation();
    const { user } = useUser();
    
    // 파라미터 추출
    const safeQuestionText = ConversationUtils.getSafeQuestionText(params.questionText);
    const userId = ConversationUtils.getUserId(user?.userId);
    
    // 상태
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [isQuestionComplete, setIsQuestionComplete] = useState(false);
    const [currentQuestionText, setCurrentQuestionText] = useState(safeQuestionText);
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [hasAIResponse, setHasAIResponse] = useState(false);
    const [emotionCaptures, setEmotionCaptures] = useState<EmotionCapture[]>([]);
    const [isQuestionTTSPlayed, setIsQuestionTTSPlayed] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);

    // AI 질문 메시지 저장
    useEffect(() => {
        const initializeQuestion = async () => {
            if (params.conversationId && safeQuestionText && !isQuestionTTSPlayed) {
                try {
                    await ConversationService.saveAIMessage(params.conversationId, safeQuestionText);
                    setIsQuestionTTSPlayed(true);
                } catch (error) {
                }
            }
        };
        
        initializeQuestion();
    }, [params.conversationId, safeQuestionText, isQuestionTTSPlayed]);

    // STT 서비스 정리
    useEffect(() => {
        return () => {
            sttService.cleanup();
        };
    }, []);

    // 질문 완료 핸들러
    const handleQuestionComplete = useCallback(() => {
        setIsQuestionComplete(true);
    }, []);


    // 대화 종료 핸들러
    const handleEndChat = useCallback(async () => {
        try {
            if (params.conversationId) {
                const result = await ConversationService.endConversation(params.conversationId);
                
                if (result.success && ConversationUtils.shouldEndConversation(result.data)) {
                    (navigation as any).navigate('ConversationEndLoading', {
                        conversationId: params.conversationId
                    });
                }
            }
        } catch (error) {
            console.error('대화 종료 실패:', error);
            ConversationUtils.showErrorAlert('대화를 종료할 수 없습니다. 다시 시도해주세요.');
        }
    }, [params.conversationId, navigation]);

    // 답변 녹음 완료 핸들러
    const handleAnswerRecordingComplete = useCallback(async (audioUri: string, questionId: string) => {
        console.log(`답변 녹음 완료 - 질문 ID: ${questionId}, 오디오 URI: ${audioUri}`);
        setIsRecording(false);
        setIsCameraVisible(false); // 녹음 완료 시 카메라 숨김
    }, []);

    // 답변 녹음 시작 핸들러
    const handleAnswerRecordingStart = useCallback(async (questionId: string) => {
        console.log(`답변 녹음 시작 - 질문 ID: ${questionId}`);
        setIsRecording(true);
        setIsCameraVisible(true); // 녹음 시작 시 카메라 표시
    }, []);

    // AI 응답 핸들러
    const handleAIResponse = useCallback(async (userText: string, audioBase64?: string, conversationMessageId?: number) => {
        console.log('사용자 발화 텍스트 받음:', userText);
        console.log('conversationMessageId 받음:', conversationMessageId);
        
        // 빈 값이면 즉시 처리 상태 시작 (마이크 버튼을 다시 눌렀을 때)
        if (!userText || userText.trim() === '') {
            console.log('즉시 처리 상태 시작 - 다음말을 생성하고 있어요...');
            setIsProcessingResponse(true);
            setIsQuestionComplete(false);
            setHasAIResponse(false); // AI 응답 상태 리셋
            return;
        }
        
        // STT 결과 유효성 검사
        if (!ConversationUtils.isValidSTTResult(userText)) {
            
            const result = await ConversationService.playSTTErrorMessage();
            if (result.success) {
                setIsQuestionComplete(true);
            }
            return;
        }
        
        try {
            // 1. 사용자 답변 처리 시작 - "다음말을 생성하고 있어요..." 표시
            setIsProcessingResponse(true);
            setTranscribedText(userText);
            setIsQuestionComplete(false); // 마이크 버튼 숨김
            
            // 감정 분석 결과 전송
            if (emotionCaptures.length > 0 && conversationMessageId) {
                await ConversationService.sendFacialEmotionAnalysis(conversationMessageId, emotionCaptures);
                await ConversationService.executeKoBERTFlow(conversationMessageId, userText);
            } else if (conversationMessageId) {
                await ConversationService.executeKoBERTFlow(conversationMessageId, userText);
            }

            // 2. GPT 답변 생성
            if (conversationMessageId) {
                const gptResponse = await ConversationService.generateAIResponse(conversationMessageId);
                
                if (gptResponse.success && gptResponse.data) {
                    // 1. AI 응답을 말풍선에 먼저 표시
                    setCurrentQuestionText(gptResponse.data.aiResponse);
                    setHasAIResponse(true);
                    
                    // 2. 이전 TTS 완전 정리 후 새 TTS 재생
                    try {
                        // 이전 TTS 완전 정리
                        await ttsService.stopAudio();
                        
                        // 새 TTS 재생
                        await ConversationService.playAIResponseTTS(gptResponse.data.aiResponse);
                        
                        // 3. TTS 재생 완료 후 마이크 버튼 다시 표시
                        setIsQuestionComplete(true);
                        setIsProcessingResponse(false);
                        setIsCameraVisible(true); // AI 응답 후 카메라 표시
                    } catch (ttsError) {
                        console.error('TTS 재생 실패:', ttsError);
                        // TTS 실패해도 UI는 정상 상태로 복구
                        setIsQuestionComplete(true);
                        setIsProcessingResponse(false);
                        setIsCameraVisible(true);
                    }
                } else {
                    console.error('AI 응답 생성 실패');
                    setIsProcessingResponse(false);
                    setIsQuestionComplete(true);
                }
            }
            
        } catch (error) {
            console.error('AI 응답 처리 중 오류:', error);
            setIsProcessingResponse(false);
            setIsQuestionComplete(true);
        }
    }, [emotionCaptures]);

    // AI 메시지 보기 핸들러
    const handleShowAIMessage = useCallback(() => {
        setIsCameraVisible(false);
    }, []);

    // 카메라로 돌아가기 핸들러
    const handleShowCamera = useCallback(() => {
        setIsCameraVisible(true);
    }, []);

    // 감정 캡처 추가
    const addEmotionCapture = useCallback((capture: EmotionCapture) => {
        setEmotionCaptures(prev => [...prev, capture]);
        console.log('감정 캡처 추가됨:', capture);
    }, []);

    return {
        // 상태
        isRecording,
        transcribedText,
        isQuestionComplete,
        currentQuestionText,
        isProcessingResponse,
        hasAIResponse,
        emotionCaptures,
        isQuestionTTSPlayed,
        isCameraVisible,
        userId,
        questionId: params.questionId || 'default-question-id',
        conversationId: params.conversationId,
        cameraSessionId: params.cameraSessionId,
        microphoneSessionId: params.microphoneSessionId,
        
        // 함수
        handleQuestionComplete,
        handleEndChat,
        handleAnswerRecordingComplete,
        handleAnswerRecordingStart,
        handleAIResponse,
        handleShowAIMessage,
        handleShowCamera,
        setCurrentQuestionText,
        setTranscribedText,
        setEmotionCaptures,
        addEmotionCapture,
    };
};
