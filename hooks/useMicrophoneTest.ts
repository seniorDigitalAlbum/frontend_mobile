import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { Audio } from 'expo-av';
import { Animated } from 'react-native';
import { MicrophoneTestService, MicrophoneTestParams, STTTestResult } from '../services/microphoneTestService';
import { MicrophoneTestUtils } from '../utils/microphoneTestUtils';

export interface UseMicrophoneTestReturn {
    // 상태
    isMicTested: boolean;
    isRecording: boolean;
    audioLevel: number;
    speechBubbleText: string;
    sttResult: STTTestResult | null;
    userId: string;
    
    // 애니메이션
    audioLevelAnimation: Animated.Value;
    
    // 함수
    handleStart: () => Promise<void>;
    startMicTest: () => Promise<void>;
    canStart: boolean;
}

export const useMicrophoneTest = (routeParams: any): UseMicrophoneTestReturn => {
    const navigation = useNavigation();
    const { user } = useUser();
    
    // 파라미터 추출
    const params = MicrophoneTestUtils.extractParams(routeParams) as MicrophoneTestParams;
    const userId = user?.userId || "1";
    
    // 상태
    const [isMicTested, setIsMicTested] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [speechBubbleText, setSpeechBubbleText] = useState("마이크를 테스트할게요.\n마이크를 눌러주세요.");
    const [sttResult, setSttResult] = useState<STTTestResult | null>(null);
    
    // refs
    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioLevelAnimation = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 대화 시작 핸들러
    const handleStart = useCallback(async () => {
        try {
            const result = await MicrophoneTestService.startConversation(
                userId, 
                params.questionId
            );

            // Conversation 화면으로 이동
            (navigation as any).navigate('Conversation', {
                questionText: params.questionText,
                questionId: params.questionId,
                conversationId: result.conversationId,
                cameraSessionId: result.cameraSessionId,
                microphoneSessionId: result.microphoneSessionId,
                userId: userId
            });
        } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            MicrophoneTestUtils.showErrorAlert('대화를 시작할 수 없습니다. 다시 시도해주세요.');
        }
    }, [navigation, userId, params.questionText, params.questionId]);

    // 마이크 테스트 시작
    const startMicTest = useCallback(async () => {
        try {
            setIsRecording(true);
            setSpeechBubbleText("말씀해주세요...\n3초 동안 아무 말이나 해주세요.");
            
            // STT 테스트 실행
            const result = await MicrophoneTestService.runSTTTest();
            setSttResult(result);
            
            setIsRecording(false);
            setAudioLevel(0);
            audioLevelAnimation.setValue(0);
            
            if (result.success) {
                // STT 성공
                setSpeechBubbleText(`"${result.text}"라고 말씀하셨네요! 마이크가 잘 되고 있습니다.`);
                await MicrophoneTestService.updateMicrophoneSession(params.microphoneSessionId);
                setIsMicTested(true);
            } else {
                // STT 실패
                setSpeechBubbleText(`다시 한 번 말 해주시겠어요?`);
                setIsMicTested(false);
            }

        } catch (error) {
            console.error('마이크 테스트 시작 실패:', error);
            setIsRecording(false);
            setSpeechBubbleText("테스트 중 오류가 발생했습니다.\n다시 시도해주세요.");
        }
    }, [params.microphoneSessionId, audioLevelAnimation]);

    // 초기 설정
    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                try {
                    MicrophoneTestService.stopRecording(recordingRef.current);
                } catch (error) {
                    console.log('Recording already unloaded');
                }
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // 시작 가능 여부
    const canStart = isMicTested;

    return {
        // 상태
        isMicTested,
        isRecording,
        audioLevel,
        speechBubbleText,
        sttResult,
        userId,
        
        // 애니메이션
        audioLevelAnimation,
        
        // 함수
        handleStart,
        startMicTest,
        canStart,
    };
};
