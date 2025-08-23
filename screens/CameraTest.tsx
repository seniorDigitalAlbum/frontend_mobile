import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import TempCamera from '../components/TempCamera';
import TempMicTest from '../components/TempMicTest';
import StartButton from '../components/StartButton';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraTest'>;

export default function CameraTest({ route, navigation }: Props) {
    const { questionText } = route.params || { questionText: '질문이 없습니다.' };
    const [isMicTested, setIsMicTested] = useState(false);

    const handleStart = () => {
        // AIChat 화면으로 이동
        navigation.navigate('AIChat', { questionText });
    };

    const handleMicTest = () => {
        setIsMicTested(true);
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
