import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import TempCamera from '../components/TempCamera';
import TempMicTest from '../components/TempMicTest';
import conversationApiService from '../services/api/conversationApiService';
import microphoneApiService from '../services/api/microphoneApiService';
import StartButton from '../components/StartButton';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraTest'>;

export default function CameraTest({ route, navigation }: Props) {
    const { 
        questionText, 
        questionId, 
        conversationId, 
        cameraSessionId, 
        microphoneSessionId 
    } = route.params || { questionText: '질문이 없습니다.' };
    const [isMicTested, setIsMicTested] = useState(false);

    const handleStart = () => {
        // ConversationFlow로 돌아가서 대화 세션 생성하도록 함
        navigation.goBack();
    };

    const handleMicTest = async () => {
        try {
            // 마이크 세션 상태를 ACTIVE로 업데이트
            if (microphoneSessionId) {
                await microphoneApiService.updateSessionStatus(microphoneSessionId, 'ACTIVE');
                console.log('마이크 세션 상태가 ACTIVE로 업데이트됨');
            }
            setIsMicTested(true);
        } catch (error) {
            console.error('마이크 세션 상태 업데이트 실패:', error);
            // 에러가 발생해도 테스트는 완료로 처리
            setIsMicTested(true);
        }
    };

    const canStart = isMicTested;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 - 질문 내용 */}
            <View className="p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-center text-black leading-6">
                    카메라와 마이크를 테스트할게요.
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

                {/* 시작하기 버튼 */}
                <View className="items-center">
                    <StartButton 
                        onPress={handleStart}
                        disabled={!canStart}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
