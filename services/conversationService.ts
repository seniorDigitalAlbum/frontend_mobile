import conversationApiService from './api/conversationApiService';
import microphoneApiService from './api/microphoneApiService';
import ttsApiService from './api/ttsApiService';
import gptApiService from './api/gptApiService';
import { sendFacialEmotionAnalysis } from './api/emotionApiService';
import conversationContextApiService from './api/conversationContextApiService';
import kobertApiService from './api/kobertApiService';
import speechEmotionApiService from './api/speechEmotionApiService';
import combinedEmotionApiService from './api/combinedEmotionApiService';
import ttsService from './audio/ttsService';

export interface EmotionCapture {
    timestamp: string;
    emotion: string;
    confidence: number;
}

export interface ConversationServiceResult {
    success: boolean;
    error?: string;
    data?: any;
}

export class ConversationService {
    /**
     * AI 질문 메시지 저장
     */
    static async saveAIMessage(conversationId: number, questionText: string): Promise<ConversationServiceResult> {
        try {
            // await conversationApiService.saveAIMessage(conversationId, questionText);
            console.log('AI 질문 메시지 저장됨:', questionText);
            return { success: true };
        } catch (error) {
            console.error('질문 초기화 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * 대화 세션 종료
     */
    static async endConversation(conversationId: number): Promise<ConversationServiceResult> {
        try {
            const endResponse = await conversationApiService.endConversation(conversationId);
            console.log('대화 세션 종료됨:', endResponse);
            return { success: true, data: endResponse };
        } catch (error) {
            console.error('대화 종료 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * STT 에러 메시지 TTS 재생
     */
    static async playSTTErrorMessage(): Promise<ConversationServiceResult> {
        try {
            const ttsResponse = await ttsApiService.synthesize({
                text: "죄송합니다. 음성을 인식할 수 없습니다. 다시 말씀해주세요.",
                voice: 'ko-KR-Wavenet-A',
                speed: 1.0,
                pitch: 0.0,
                volume: 0.0,
                format: 'MP3'
            });

            if (ttsResponse.status === 'success' && ttsResponse.audioData) {
                await ttsService.playAudio(ttsResponse.audioData, 'mp3');
                console.log('🎵 STT 에러 메시지 TTS 재생 완료');
                return { success: true };
            } else {
                console.error('❌ STT 에러 메시지 TTS 응답이 유효하지 않음:', ttsResponse);
                return { success: false, error: 'TTS 응답이 유효하지 않음' };
            }
        } catch (error) {
            console.error('STT 에러 메시지 TTS 재생 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * 표정 감정 분석 전송
     */
    static async sendFacialEmotionAnalysis(
        conversationMessageId: number,
        emotionCaptures: EmotionCapture[]
    ): Promise<ConversationServiceResult> {
        try {
            const emotionCounts = emotionCaptures.reduce((acc, capture) => {
                acc[capture.emotion] = (acc[capture.emotion] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const finalEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
            
            const finalEmotionCaptures = emotionCaptures.filter(capture => capture.emotion === finalEmotion);
            const averageConfidence = finalEmotionCaptures.reduce((sum, capture) => sum + capture.confidence, 0) / finalEmotionCaptures.length;

            console.log('감정 분석 결과 전송 - conversationMessageId:', conversationMessageId);
            
            await sendFacialEmotionAnalysis({
                conversationMessageId: conversationMessageId,
                finalEmotion,
                totalCaptures: emotionCaptures.length,
                emotionCounts,
                averageConfidence,
                captureDetails: emotionCaptures
            });
            
            console.log('표정 감정 분석 저장 완료');
            return { success: true };
        } catch (error) {
            console.error('❌ 표정 감정 분석 저장 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * KoBERT 플로우 실행
     */
    static async executeKoBERTFlow(conversationMessageId: number, userText: string): Promise<ConversationServiceResult> {
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
                const combinedEmotionResponse = await combinedEmotionApiService.combineEmotions({
                    conversationMessageId: conversationMessageId
                });
                console.log('통합 감정 분석 완료:', combinedEmotionResponse);
            } catch (error) {
                console.error('통합 감정 분석 실패:', error);
                console.log('표정 감정과 말 감정이 모두 저장되었는지 확인해주세요.');
            }

            return { success: true };
        } catch (error) {
            console.error('KoBERT 플로우 실행 중 오류:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * GPT 응답 생성 (TTS 재생 없이)
     */
    static async generateAIResponse(conversationMessageId: number): Promise<ConversationServiceResult> {
        try {
            const gptResponse = await gptApiService.generateResponse({
                conversationMessageId: conversationMessageId
            });

            if (!gptResponse) {
                return { success: false, error: 'GPT 응답 생성 실패' };
            }

            return { success: true, data: gptResponse };
        } catch (error) {
            console.error('AI 응답 생성 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * AI 응답 TTS 재생
     */
    static async playAIResponseTTS(aiResponse: string): Promise<ConversationServiceResult> {
        try {
            console.log('🎵 AI 응답 TTS 재생 시작:', aiResponse);
            const ttsResponse = await ttsApiService.synthesize({
                text: aiResponse,
                voice: 'ko-KR-Wavenet-A',
                speed: 1.0,
                pitch: 0.0,
                volume: 0.0,
                format: 'MP3'
            });

            if (ttsResponse.status === 'success' && ttsResponse.audioData) {
                await ttsService.playAudio(ttsResponse.audioData, 'mp3');
                console.log('🎵 AI 응답 TTS 재생 완료');
                return { success: true };
            } else {
                console.error('❌ TTS 응답이 유효하지 않음:', ttsResponse);
                return { success: false, error: 'TTS 응답이 유효하지 않음' };
            }
        } catch (error) {
            console.error('AI 응답 TTS 재생 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * GPT 응답 생성 및 TTS 재생 (기존 메서드 - 호환성 유지)
     */
    static async generateAndPlayAIResponse(conversationMessageId: number): Promise<ConversationServiceResult> {
        try {
            const gptResponse = await gptApiService.generateResponse({
                conversationMessageId: conversationMessageId
            });

            if (!gptResponse) {
                return { success: false, error: 'GPT 응답 생성 실패' };
            }

            // AI 응답 TTS 재생
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

            return { success: true, data: gptResponse };
        } catch (error) {
            console.error('AI 응답 생성 및 재생 실패:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * 처리 상태 확인 및 일기 조회
     */
    static async checkProcessingAndGetDiary(conversationId: number): Promise<ConversationServiceResult> {
        try {
            const checkStatus = async (): Promise<any> => {
                const statusResponse = await conversationApiService.getProcessingStatus(conversationId);
                
                if (statusResponse && !statusResponse.isProcessing) {
                    // 처리 완료 - 일기 조회
                    const diaryResponse = await conversationApiService.getDiary(conversationId);
                    return diaryResponse;
                } else {
                    // 아직 처리 중 - 2초 후 다시 확인
                    return new Promise((resolve) => {
                        setTimeout(async () => {
                            const result = await checkStatus();
                            resolve(result);
                        }, 2000);
                    });
                }
            };
            
            const diaryResponse = await checkStatus();
            return { success: true, data: diaryResponse };
        } catch (error) {
            console.error('일기 생성 처리 중 오류:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
