import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AICharacter from '../components/AICharacter';
import AnswerButton from '../components/AnswerButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AIChat'>;

export default function AIChat({ route, navigation }: Props) {
    const { questionText } = route.params || { questionText: '질문이 없습니다.' };

    const handleAnswer = () => {
        // 사용자 답변 화면으로 이동
        navigation.navigate('UserAnswer', { questionText });
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
                </View>
                
                {/* 답변하기 버튼 */}
                <View className="w-full px-6">
                    <AnswerButton onPress={handleAnswer} />
                </View>
            </View>
        </SafeAreaView>
    );
} 