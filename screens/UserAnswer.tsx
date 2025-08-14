import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import TempCamera from '../components/TempCamera';
import TempMicTest from '../components/TempMicTest';
import NextButton from '../components/NextButton';
import EndChatButton from '../components/EndChatButton';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'UserAnswer'>;

export default function UserAnswer({ route, navigation }: Props) {
    const { questionText } = route.params || { questionText: '질문이 없습니다.' };
    const [isMicTested, setIsMicTested] = useState(false);

    const handleNext = () => {
        // AI가 새로운 질문을 하는 화면으로 이동
        navigation.navigate('AIChat', { questionText: '새로운 질문입니다.' });
    };

    const handleEndChat = () => {
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
                    message: '사용자의 답변 내용입니다.',
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 - 질문 내용 */}
            <View className="p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-center text-black leading-6">
                    {questionText}
                </Text>
            </View>

            {/* 메인 컨텐츠 */}
            <View className="flex-1 p-6">
                {/* 카메라 화면 */}
                <View className="mb-8">
                    <TempCamera />
                </View>

                {/* 마이크 테스트 */}
                <View className="items-center mb-8">
                    <TempMicTest 
                        isTested={isMicTested}
                        onTest={handleMicTest}
                    />
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