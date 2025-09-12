import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AICharacter from '../components/AICharacter';
import AnswerButton from '../components/AnswerButton';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';
import ttsService from '../services/audio/ttsService';
import { useEffect, useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'AIChat'>;

export default function AIChat({ route, navigation }: Props) {
    const { 
        questionText, 
        questionId, 
        conversationId, 
        cameraSessionId, 
        microphoneSessionId 
    } = route.params || { questionText: '질문이 없습니다.' };
    
    const [isPlaying, setIsPlaying] = useState(false);

    // AI 질문 메시지 저장 및 TTS 재생
    useEffect(() => {
        const saveAIMessageAndPlayTTS = async () => {
            if (conversationId && questionText) {
                try {
                    await conversationApiService.saveAIMessage(conversationId, questionText);
                    console.log('AI 질문 메시지 저장됨:', questionText);
                } catch (error) {
                    console.error('AI 질문 메시지 저장 실패:', error);
                }
            }
            
            // TTS 재생
            try {
                setIsPlaying(true);
                const ttsResult = await ttsService.synthesizeText(questionText);
                
                if (ttsResult && ttsResult.audioData) {
                    await ttsService.playAudio(ttsResult.audioData, ttsResult.format);
                } else {
                    console.error('TTS 변환 실패');
                }
            } catch (error) {
                console.error('TTS 재생 실패:', error);
            } finally {
                setIsPlaying(false);
            }
        };
        
        saveAIMessageAndPlayTTS();
        
        return () => {
            ttsService.stopAudio();
        };
    }, [conversationId, questionText]);

    const handleAnswer = async () => {
        try {
            // 발화 시작 API 호출
            if (microphoneSessionId && cameraSessionId) {
                const userId = 'user-123'; // 실제로는 로그인된 사용자 ID 사용
                const speechStartResponse = await microphoneApiService.startSpeech({
                    microphoneSessionId,
                    cameraSessionId,
                    userId
                });
                console.log('발화 시작됨:', speechStartResponse);
            }
        } catch (error) {
            console.error('발화 시작 실패:', error);
        }
        
        // 사용자 답변 화면으로 이동
        navigation.navigate('UserAnswer', { 
            questionText,
            questionId,
            conversationId,
            cameraSessionId,
            microphoneSessionId
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* AI 캐릭터 */}
            <View className="flex-1 justify-center items-center">
                <AICharacter />
                
                {/* 질문 텍스트 */}
                <View className="px-8 mb-8">
                    <Text className="text-xl font-semibold text-center text-gray-800 leading-7">
                        {questionText}
                    </Text>
                    {/* TTS 재생 상태 표시 */}
                    {isPlaying && (
                        <View className="mt-4 bg-blue-100 px-4 py-2 rounded-full">
                            <Text className="text-blue-600 font-medium text-center">
                                🔊 AI가 질문을 읽고 있습니다...
                            </Text>
                        </View>
                    )}
                </View>
                
                {/* 답변하기 버튼 */}
                <View className="w-full px-6">
                    <AnswerButton onPress={handleAnswer} />
                </View>
            </View>
        </SafeAreaView>
    );
} 