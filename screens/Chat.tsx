import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useState } from 'react';
import DiaryLoading from '../components/DiaryLoading';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function Chat({ route, navigation }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    
    // 전달받은 대화 데이터 또는 기본 데이터 사용
    const chatHistory = route.params?.chatHistory || [
        {
            id: 1,
            type: 'ai',
            message: '오늘 하루는 어땠나요?',
            timestamp: '14:30'
        },
        {
            id: 2,
            type: 'user',
            message: '정말 좋았어요! 친구들과 재미있게 놀았어요.',
            timestamp: '14:32'
        }
    ];

    // 대화 세션 정보 추출
    const conversationId = route.params?.conversationId;
    const userId = 'user123'; // 임시 사용자 ID, 나중에 실제 사용자 ID로 교체

    const handleGenerateDiary = async () => {
        setIsGenerating(true);
        
        try {
            // 백엔드로 데이터 전송 (나중에 구현)
            console.log('백엔드로 데이터 전송 중...');
            
            // 임시로 3초 대기 (실제로는 백엔드 응답 대기)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('일기 생성 완료!');
            
            // 생성된 일기를 DiaryResult 화면으로 전달
            const generatedDiary = `오늘은 정말 특별한 하루였습니다. 친구들과 함께 공원에서 숨바꼭질을 하며 즐거운 시간을 보냈습니다. 

햇살이 따뜻하게 비치는 날씨 속에서 우리는 웃음소리를 내며 뛰어다녔고, 서로를 찾는 과정에서 더욱 친해질 수 있었습니다. 

특히 숨는 곳을 찾는 재미와 찾는 사람의 긴장감이 어우러져서 정말 재미있었습니다. 이런 순간들이 모여 오늘 하루를 특별하게 만들어주었어요.

내일도 이런 즐거운 일들이 가득했으면 좋겠습니다.`;
            
            navigation.navigate('DiaryResult', { 
                diary: generatedDiary,
                conversationId,
                finalEmotion: '기쁨', // 임시 감정, 나중에 실제 감정 분석 결과로 교체
                userId
            });
            
        } catch (error) {
            console.error('일기 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 로딩 중일 때는 로딩 화면 표시
    if (isGenerating) {
        return <DiaryLoading />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 채팅 내용 */}
            <ScrollView className="flex-1 px-4 py-4">
                {chatHistory.map((chat) => (
                    <View key={chat.id} className={`mb-4 ${chat.type === 'ai' ? 'items-start' : 'items-end'}`}>
                        {/* AI 메시지 */}
                        {chat.type === 'ai' && (
                            <View className="flex-row items-end space-x-2">
                                <View className="w-8 h-8 bg-blue-100 rounded-full justify-center items-center">
                                    <Ionicons name="person" size={20} color="#3B82F6" />
                                </View>
                                <View className="max-w-[80%] bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                                    <Text className="text-gray-800">{chat.message}</Text>
                                    <Text className="text-xs text-gray-500 mt-1">{chat.timestamp}</Text>
                                </View>
                            </View>
                        )}
                        
                        {/* 사용자 메시지 */}
                        {chat.type === 'user' && (
                            <View className="flex-row items-end space-x-2 justify-end">
                                <View className="max-w-[80%] bg-purple-500 p-3 rounded-2xl rounded-br-md">
                                    <Text className="text-white">{chat.message}</Text>
                                    <Text className="text-xs text-purple-100 mt-1">{chat.timestamp}</Text>
                                </View>
                                <View className="w-8 h-8 bg-purple-100 rounded-full justify-center items-center">
                                    <Ionicons name="person" size={20} color="#8B5CF6" />
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* 일기 생성하기 버튼 */}
            <View className="bg-white p-6 border-t border-gray-200">
                <TouchableOpacity
                    onPress={handleGenerateDiary}
                    className="w-full bg-purple-500 py-4 rounded-2xl items-center shadow-lg"
                    activeOpacity={0.8}
                    disabled={isGenerating}
                >
                    <Text className="text-lg font-semibold text-white">
                        📝 일기 생성하기
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
