import { Alert } from 'react-native';

export interface ConversationParams {
    questionText?: string;
    questionId?: string;
    conversationId?: number;
    cameraSessionId?: string;
    microphoneSessionId?: string;
}

export interface EmotionCapture {
    timestamp: string;
    emotion: string;
    confidence: number;
}

export class ConversationUtils {
    /**
     * 라우트 파라미터에서 안전한 질문 텍스트 추출
     */
    static getSafeQuestionText(questionText?: string): string {
        return questionText || '안녕하세요, 오늘 하루는 어떠셨나요?';
    }

    /**
     * 사용자 ID 추출 (기본값: "1")
     */
    static getUserId(userId?: string): string {
        return userId || "1";
    }

    /**
     * STT 결과 유효성 검사
     */
    static isValidSTTResult(userText: string | null): boolean {
        return !!(userText && userText.trim() !== '');
    }

    /**
     * 감정 분석 결과에서 최종 감정 추출
     */
    static getFinalEmotion(emotionCaptures: EmotionCapture[]): {
        emotion: string;
        confidence: number;
    } {
        if (emotionCaptures.length === 0) {
            return { emotion: 'neutral', confidence: 0 };
        }

        const emotionCounts = emotionCaptures.reduce((acc, capture) => {
            acc[capture.emotion] = (acc[capture.emotion] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const finalEmotion = Object.keys(emotionCounts).reduce((a, b) => 
            emotionCounts[a] > emotionCounts[b] ? a : b
        );
        
        const finalEmotionCaptures = emotionCaptures.filter(capture => capture.emotion === finalEmotion);
        const averageConfidence = finalEmotionCaptures.reduce((sum, capture) => sum + capture.confidence, 0) / finalEmotionCaptures.length;

        return { emotion: finalEmotion, confidence: averageConfidence };
    }

    /**
     * 에러 알림 표시
     */
    static showErrorAlert(message: string): void {
        Alert.alert('오류', message);
    }

    /**
     * 성공 알림 표시
     */
    static showSuccessAlert(message: string): void {
        Alert.alert('성공', message);
    }

    /**
     * 녹음 시간 포맷팅
     */
    static formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 대화 상태 메시지 생성
     */
    static getStatusMessage(isQuestionComplete: boolean, isProcessingResponse: boolean): string | null {
        if (!isQuestionComplete) {
            return "말하는 중이에요";
        }
        if (isProcessingResponse) {
            return "다음 말을 생각하고 있어요...";
        }
        return null;
    }

    /**
     * 녹음 상태 메시지 생성
     */
    static getRecordingMessage(isRecording: boolean): string | null {
        return isRecording ? "듣고 있어요." : null;
    }

    /**
     * 대화 세션 종료 확인
     */
    static shouldEndConversation(endResponse: any): boolean {
        return endResponse && endResponse.status === 'COMPLETED';
    }

    /**
     * 일기 결과 네비게이션 파라미터 생성
     */
    static createDiaryNavigationParams(diaryResponse: any, conversationId: number) {
        return {
            diary: diaryResponse.diary,
            conversationId: diaryResponse.conversationId,
            finalEmotion: '기쁨', // 기본값으로 설정 (백엔드에서 emotionSummary 제거됨)
            userId: "1",
            musicRecommendations: diaryResponse.musicRecommendations
        };
    }
}