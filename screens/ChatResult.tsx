import { View, Text, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AICharacter from '../components/AICharacter';
import NextButton from '../components/NextButton';
import EndChatButton from '../components/EndChatButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatResult'>;

export default function ChatResult({ route, navigation }: Props) {
    const { questionText } = route.params || { questionText: '질문이 없습니다.' };

    const handleNext = () => {
        // 다음 질문으로 이동하거나 다른 화면으로 이동
        // 여기에 다음 로직 추가
        console.log('다음으로 이동');
    };

    const handleEndChat = () => {
        // 대화 종료 후 모든 화면 스택을 초기화하고 Home으로 이동
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* AI 캐릭터 */}
            <View className="flex-1 justify-center items-center">
                <AICharacter />
                
                {/* 답변 완료 메시지 */}
                <View className="px-8 mb-8">
                    <Text className="text-xl font-semibold text-center text-gray-800 leading-7">
                        답변이 완료되었습니다!
                    </Text>
                </View>
                
                {/* 버튼들 */}
                <View className="w-full px-6 space-y-4">
                    <NextButton onPress={handleNext} />
                    <EndChatButton onPress={handleEndChat} />
                </View>
            </View>
        </SafeAreaView>
    );
} 