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
    const [isCameraReady, setIsCameraReady] = useState(false);

    const handleStart = async () => {
        try {
            // 대화 세션 시작
            const startResponse = await conversationApiService.startConversation({
                userId: "1",
                questionId: questionId || 1
            });

            console.log('대화 세션 시작됨:', startResponse);

            // Conversation 화면으로 이동
            navigation.navigate('Conversation', {
                questionText: questionText,
                questionId: questionId,
                conversationId: startResponse.conversationId,
                cameraSessionId: startResponse.cameraSessionId,
                microphoneSessionId: startResponse.microphoneSessionId,
                userId: "1"
            });
        } catch (error) {
            console.error('대화 세션 시작 실패:', error);
            Alert.alert('오류', '대화를 시작할 수 없습니다. 다시 시도해주세요.');
        }
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

    const handleCameraReady = () => {
        setIsCameraReady(true);
    };

    const canStart = isMicTested;

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* 헤더 - 질문 내용 */}
            <View className="p-6 border-b border-gray-200 bg-white">
                <Text className="text-xl font-bold text-center text-black leading-6">
                    카메라와 마이크를 테스트할게요.
                </Text>
            </View>

            {/* 메인 컨텐츠 - 헤더 밑에 꽉 차도록 */}
            <View className="flex-1">
                <TempCamera 
                    onCameraReady={handleCameraReady}
                    navigation={navigation}
                    route={route}
                />
            </View>
        </SafeAreaView>
    );
}
